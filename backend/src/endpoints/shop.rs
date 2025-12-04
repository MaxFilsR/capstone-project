use {
    crate::utils::{
        jwt::AuthenticatedUser,
        schemas::*,
    },
    actix_web::{
        HttpResponse,
        get,
        web,
        put,
        post,
    },
    std::collections::HashMap,
    serde::{Serialize, Deserialize},
    once_cell::sync::Lazy,
    sqlx::PgPool,
};

// Define static mapping of item rarity to prices
static RARITY_PRICES: Lazy<HashMap<ItemRarity, i32>> = Lazy::new(|| {
    let mut map = HashMap::new();
    map.insert(ItemRarity::Default, 0); 
    map.insert(ItemRarity::Common, 100);
    map.insert(ItemRarity::Uncommon, 250);
    map.insert(ItemRarity::Rare, 500);
    map.insert(ItemRarity::Epic, 1000);
    map.insert(ItemRarity::Legendary, 2500);
    map
});

#[derive(Serialize)]
pub struct ShopItem {
    pub id: i32,
    pub name: String,
    pub category: ItemCategory,
    pub rarity: ItemRarity,
    pub path: String,
    pub price: i32,     // based on rarity
}

#[derive(Deserialize)]
pub struct BuyItemRequest {
    pub item_id: i32,
}

#[get("/shop")]
pub async fn get_shop(
    _user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    // matches items in shop with their details from items table
    let shop_items_result = sqlx::query!(
        r#"
        SELECT i.id, i.name, i.category as "category: ItemCategory", 
               i.rarity as "rarity: ItemRarity", i.path
        FROM shop s
        JOIN items i ON s.item_id = i.id
        ORDER BY s.added_at DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match shop_items_result {
        Ok(queries) => {
            let items: Vec<ShopItem> = queries
                .into_iter()
                .map(|q| ShopItem {
                    id: q.id,
                    name: q.name,
                    category: q.category,
                    rarity: q.rarity.clone(),       
                    path: q.path,
                    price: *RARITY_PRICES.get(&q.rarity).unwrap_or(&100),  // default price if rarity not found (misspelled)
                })
                .collect();
            
            HttpResponse::Ok().json(items)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch shop items"),
    }
}


// For Demo purposes so we can manually refresh the shop with random items (it resets globally)
#[put("/shop/refresh")]
pub async fn refresh_shop(
    _user: AuthenticatedUser,  
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to start transaction"),
    };

    // Clear current shop
    let clear_result = sqlx::query!("DELETE FROM shop")
        .execute(&mut *tx)
        .await;

    if clear_result.is_err() {
        let _ = tx.rollback().await;
        return HttpResponse::InternalServerError().body("Failed to clear shop");
    }

    // Get 10 random item IDs (excluding default rarity)
    let random_items = sqlx::query!(
        r#"
        SELECT id
        FROM items
        WHERE rarity != 'default' 
        ORDER BY RANDOM()
        LIMIT 10
        "#
    )
    .fetch_all(&mut *tx)
    .await;

    let item_ids: Vec<i32> = match random_items {
        Ok(queries) => queries.into_iter().map(|q| q.id).collect(),
        Err(_) => {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().body("Failed to select random items");
        }
    };

    // Insert all 10 items into shop
    for item_id in &item_ids {
        let insert_result = sqlx::query!(
            r#"
            INSERT INTO shop (item_id)
            VALUES ($1)
            "#,
            item_id
        )
        .execute(&mut *tx)
        .await;

        if insert_result.is_err() {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().body("Failed to add items into shop");
        }
    }

    // Commit transaction
    if tx.commit().await.is_err() {
        return HttpResponse::InternalServerError().body("Failed to commit transaction");
    }

    HttpResponse::Ok().json(serde_json::json!({
        "message": "Shop refreshed with 10 random items",
        "item_count": item_ids.len()
    }))
}

#[post("/shop/buy")]
pub async fn buy_item(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<BuyItemRequest>,
) -> HttpResponse {
    let item_id = req.item_id;

    // Make sure everything works if not rollback the changes
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to start transaction"),
    };

    // Check if item is in shop
    let item_in_shop = sqlx::query!(
        r#"
        SELECT EXISTS(SELECT 1 FROM shop WHERE item_id = $1) as "exists!"
        "#,
        item_id
    )
    .fetch_one(&mut *tx)
    .await;

    match item_in_shop {
        Ok(query) => {
            if !query.exists {
                let _ = tx.rollback().await;
                return HttpResponse::NotFound().body("Item is not available in shop");
            }
        }
        Err(_) => {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().body("Failed to verify item");
        }
    }

    // Get item details (rarity and category) 
    let item_details = sqlx::query!(
        r#"
        SELECT rarity as "rarity: ItemRarity", category as "category: ItemCategory"
        FROM items
        WHERE id = $1
        "#,
        item_id
    )
    .fetch_one(&mut *tx)
    .await;

    let (rarity, category) = match item_details {
        Ok(query) => (query.rarity, query.category),
        Err(_) => {
            let _ = tx.rollback().await;
            return HttpResponse::NotFound().body("Item not found");
        }
    };

    // Calculate price from rarity (if non default to 100)
    let price = *RARITY_PRICES.get(&rarity).unwrap_or(&100);

    // Get user's current coins and inventory
    let user_data = sqlx::query!(
        r#"
        SELECT coins, inventory as "inventory: Inventory"
        FROM characters
        WHERE user_id = $1
        "#,
        user.id
    )
    .fetch_one(&mut *tx)
    .await;

    let (current_coins, mut inventory) = match user_data {
        Ok(query) => (query.coins, query.inventory),
        Err(_) => {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().body("Failed to fetch user data");
        }
    };

    // Check if user has enough coins
    if current_coins < price {
        let _ = tx.rollback().await;
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Not enough coins",
            "required": price,
            "available": current_coins
        }));
    }

    // Check if user already owns this item
    let already_owned = match category {
        ItemCategory::Arm => inventory.arms.contains(&item_id),
        ItemCategory::Background => inventory.backgrounds.contains(&item_id),
        ItemCategory::Body => inventory.bodies.contains(&item_id),
        ItemCategory::Head => inventory.heads.contains(&item_id),
        ItemCategory::Head_Accessory => inventory.head_accessories.contains(&item_id),
        ItemCategory::Pet => inventory.pets.contains(&item_id),
        ItemCategory::Weapon => inventory.weapons.contains(&item_id),
    };

    if already_owned {
        let _ = tx.rollback().await;
        return HttpResponse::BadRequest().body("You already own this item");
    }

    // Add item to appropriate inventory array
    match category {
        ItemCategory::Arm => inventory.arms.push(item_id),
        ItemCategory::Background => inventory.backgrounds.push(item_id),
        ItemCategory::Body => inventory.bodies.push(item_id),
        ItemCategory::Head => inventory.heads.push(item_id),
        ItemCategory::Head_Accessory => inventory.head_accessories.push(item_id),
        ItemCategory::Pet => inventory.pets.push(item_id),
        ItemCategory::Weapon => inventory.weapons.push(item_id),
    }

    // Update user's coins and inventory
    let new_coins = current_coins - price;
    let update_result = sqlx::query!(
        r#"
        UPDATE characters
        SET coins = $1, inventory = $2
        WHERE user_id = $3
        "#,
        new_coins,
        inventory as Inventory,
        user.id
    )
    .execute(&mut *tx)
    .await;

    if update_result.is_err() {
        let _ = tx.rollback().await;
        return HttpResponse::InternalServerError().body("Failed to update user data");
    }

    if tx.commit().await.is_err() {
        return HttpResponse::InternalServerError().body("Failed to commit transaction");
    }

    HttpResponse::Ok().json(serde_json::json!({
        "message": "Item purchased successfully",
        "item_id": item_id,
        "price": price,
        "rarity": rarity,
        "remaining_coins": new_coins
    }))
}
use {
    crate::{
        endpoints::constants::constants::ITEMS_PATH,
        utils::schemas::{
            ItemCategory,
            ItemRarity,
            ItemRow,
        },
    },
    actix_web::{
        HttpResponse,
        web,
        post
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::PgPool,
    std::path::Path,
};

#[derive(Deserialize, Serialize)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub category: ItemCategory,
    pub rarity: ItemRarity,
    pub bytes: Vec<u8>,
}

#[derive(Deserialize, Serialize)]
pub struct ItemsRequest {
    ids: Vec<i32>,
}

#[derive(Deserialize, Serialize)]
pub struct ItemsResponse {
    items: Vec<Item>,
}

#[post("/constants/items")]
pub async fn items(
    pool: web::Data<PgPool>,
    request: web::Json<ItemsRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query: Vec<ItemRow> = sqlx::query_as!(
        ItemRow,
        r#"
            SELECT id, name, category as "category: ItemCategory", rarity as "rarity: ItemRarity", path
            FROM items
            WHERE id = ANY($1) 
        "#,
        &request.ids
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    let items: Vec<Item> = query
        .into_iter()
        .map(|row| Item {
            id: row.id,
            name: row.name,
            category: row.category,
            rarity: row.rarity,
            bytes: {
                let path = Path::new(ITEMS_PATH).join(&row.path);
                std::fs::read(&path).unwrap_or_else(|_| {
                    panic!(
                        "Failed to read asset with id = {} and path = {}",
                        row.id,
                        &path.display()
                    )
                })
            },
        })
        .collect();

    return Ok(HttpResponse::Ok().json(ItemsResponse { items }));
}

use {
    crate::utils::{
        jwt::AuthenticatedUser,
        schemas::*,
    },
    actix_web::{
        HttpResponse,
        Result,
        error::ErrorBadRequest,
        post,
        web,
    },
    rand::seq::IndexedRandom,
    serde::Deserialize,
    sqlx::PgPool,
};

#[derive(Deserialize)]
struct OnboardingRequest {
    first_name: String,
    last_name: String,
    class_id: i32,
    workout_schedule: [bool; 7],
    username: String,
}

#[post("/onboarding")]
async fn onboarding(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<OnboardingRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            SELECT user_id 
            FROM characters 
            WHERE username = $1
        "#,
        &request.username
    )
    .fetch_optional(pool.get_ref())
    .await
    .unwrap();

    if query.is_some() {
        return Err(ErrorBadRequest("This username is already taken"));
    }

    let _query = sqlx::query!(
        r#"
            INSERT INTO settings (user_id, first_name, last_name, workout_schedule) 
            VALUES ($1, $2, $3, $4)
        "#,
        user.id,
        &request.first_name,
        &request.last_name,
        &request.workout_schedule,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    let class: Class = sqlx::query_as!(
        Class,
        r#"
            SELECT name, stats as "stats: Stats"
            FROM classes
            WHERE id = $1
        "#,
        request.class_id
    )
    .fetch_one(pool.as_ref())
    .await
    .unwrap();

    let inventory = populate_inventory(pool.get_ref()).await;
    let equipped = populate_equipped(&inventory);

    let _query = sqlx::query!(
        r#"
            INSERT INTO characters (user_id, username, class, level, exp_leftover, pending_stat_points, streak, equipped, inventory)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        "#,
        user.id,
        &request.username,
        class as Class,
        1,
        0,
        0,
        0,
        equipped as Equipped,
    	inventory as Inventory,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    let _query = sqlx::query!(
        r#"
            UPDATE users
            SET onboarding_complete = TRUE
            WHERE id = $1
        "#,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}

pub async fn populate_inventory(pool: &PgPool) -> Inventory {
    let mut inventory = Inventory::default();

    let color = ["Black", "Brown", "White"]
        .choose(&mut rand::rng())
        .unwrap();

    let query = sqlx::query!(
        r#"
            SELECT id, category as "category: ItemCategory"
            FROM items
            WHERE rarity = 'default' AND (category NOT IN ('head', 'body', 'arm') OR name ILIKE '%' || $1 || '%')
        "#,
        color
    )
    .fetch_all(pool)
    .await
    .unwrap();

    for record in query {
        let vec = match record.category {
            ItemCategory::Arm => &mut inventory.arms,
            ItemCategory::Background => &mut inventory.backgrounds,
            ItemCategory::Body => &mut inventory.bodies,
            ItemCategory::Head => &mut inventory.heads,
            // TODO: For some reason there is an error if the enum variant is not called `Head_Accessory` rather than the prefered `HeadAccessory`
            ItemCategory::Head_Accessory => &mut inventory.head_accessories,
            ItemCategory::Pet => &mut inventory.pets,
            ItemCategory::Weapon => &mut inventory.weapons,
        };
        vec.push(record.id);
    }

    return inventory;
}

pub fn populate_equipped(inventory: &Inventory) -> Equipped {
    let equipped = Equipped {
        arms: *inventory.arms.choose(&mut rand::rng()).unwrap(),
        background: *inventory.backgrounds.choose(&mut rand::rng()).unwrap(),
        body: *inventory.bodies.choose(&mut rand::rng()).unwrap(),
        head: *inventory.heads.choose(&mut rand::rng()).unwrap(),
        head_accessory: *inventory.head_accessories.choose(&mut rand::rng()).unwrap(),
        pet: inventory.pets.choose(&mut rand::rng()).cloned(),
        weapon: inventory.weapons.choose(&mut rand::rng()).cloned(),
    };

    return equipped;
}

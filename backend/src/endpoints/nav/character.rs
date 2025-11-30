use {
    crate::utils::{
        jwt::AuthenticatedUser,
        level::exp_needed_for_level,
        schemas::{
            Character,
            Class,
            Equipped,
            Inventory,
            Settings,
        },
    },
    actix_web::{
        HttpResponse,
        get,
        put,
        web,
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::PgPool,
};

#[derive(Deserialize, Serialize)]
pub struct ReadCharacterResponse {
    username: String,
    class: Class,
    level: i32,
    exp_leftover: i32,
    exp_needed: i32,
    pending_stat_points: i32,
    streak: i32,
    coins: i32,
    equipped: Equipped,
    inventory: Inventory,
    friends: Vec<i32>,
}

#[get("/character")]
pub async fn read_character(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let query: Character = sqlx::query_as!(
        Character,
        r#"
            SELECT username, class as "class: Class", level, exp_leftover, pending_stat_points, streak, coins, equipped as "equipped: Equipped", inventory as "inventory: Inventory", friends
            FROM characters
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadCharacterResponse {
        username: query.username,
        class: query.class,
        level: query.level,
        exp_leftover: query.exp_leftover,
        exp_needed: exp_needed_for_level(query.level + 1),
        pending_stat_points: query.pending_stat_points,
        streak: query.streak,
        coins: query.coins,
        equipped: query.equipped,
        inventory: query.inventory,
        friends: query.friends,
    }));
}

// pub struct UpdateCharacterRequest {
//     equipped: Equipped,
// }
// #[put("/character")]
// pub async fn update_character(
//     user: AuthenticatedUser,
//     pool: web::Data<PgPool>,
// ) -> Result<HttpResponse, actix_web::Error> {
//     todo!();
// }

#[derive(Deserialize, Serialize)]
pub struct ReadSettingsResponse {
    email: String,
    first_name: String,
    last_name: String,
    workout_schedule: Vec<bool>,
}

#[get("/character/settings")]
pub async fn read_settings(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let email = sqlx::query_scalar!(
        r#"
            SELECT email
            FROM users
            where id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    let query: Settings = sqlx::query_as!(
        Settings,
        r#"
            SELECT first_name, last_name, workout_schedule
            FROM settings
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadSettingsResponse {
        email,
        first_name: query.first_name,
        last_name: query.last_name,
        workout_schedule: query.workout_schedule,
    }));
}

#[derive(Deserialize, Serialize)]
pub struct ReadInventoryResponse {
    inventory: Inventory,
}

#[get("/character/inventory")]
pub async fn read_inventory(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let query: Inventory = sqlx::query_scalar!(
        r#"
            SELECT inventory as "inventory: Inventory"
            FROM characters
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadInventoryResponse { inventory: query }));
}

#[derive(Deserialize, Serialize)]
pub struct UpdateInventoryResponse {
    inventory: Inventory,
}
#[put("/character/inventory")]
pub async fn update_inventory(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateInventoryResponse>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            UPDATE characters
            SET inventory = $2 
            where user_id = $1
        "#,
        user.id,
        request.inventory.to_owned() as Inventory,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct ReadEquippedResponse {
    equipped: Equipped,
}

#[get("/character/equipped")]
pub async fn read_equipped(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let query: Equipped = sqlx::query_scalar!(
        r#"
            SELECT equipped as "equipped: Equipped"
            FROM characters
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadEquippedResponse { equipped: query }));
}

#[derive(Deserialize, Serialize)]
pub struct UpdateEquippedResponse {
    equipped: Equipped,
}
#[put("/character/equipped")]
pub async fn update_equipped(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateEquippedResponse>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            UPDATE characters
            SET equipped = $2 
            where user_id = $1
        "#,
        user.id,
        request.equipped as Equipped,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

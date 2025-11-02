use crate::jwt::AuthenticatedUser;
use crate::schemas::*;
use actix_web::{HttpResponse, get, put, web};
use crate::level::exp_needed_for_level;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;


#[derive(Serialize, Deserialize)]
pub struct ReadCharacterResponse {
    username: String,
    class: Class,
    level: i32,
    exp_leftover: i32,
    exp_needed: i32,
    streak: i32,
    equipped: Equipped,
    inventory: Inventory,
}

#[get("/character")]
pub async fn read_character(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let response: Character = sqlx::query_as!(
        Character,
        r#"
            SELECT username, class as "class: Class", level, exp_leftover, streak, equipped as "equipped: Equipped", inventory as "inventory: Inventory"
            FROM characters
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadCharacterResponse {
        username: response.username,
        class: response.class,
        level: response.level,
        exp_leftover: response.exp_leftover,
        exp_needed: exp_needed_for_level(response.level + 1),
        streak: response.streak,
        equipped: response.equipped,
        inventory: response.inventory,
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

// pub struct ReadSettingsResponse {
//     first_name: String,
//     last_name: String,
//     email: String,
//     password: String,
//     workout_schedule: Vec<bool>,
// }

// #[get("/character/settings")]
// pub async fn read_settings(
//     user: AuthenticatedUser,
//     pool: web::Data<PgPool>,
// ) -> Result<HttpResponse, actix_web::Error> {
//     todo!();
// }

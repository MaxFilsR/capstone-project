use crate::jwt::AuthenticatedUser;
use crate::schemas::Class;
use actix_web::{HttpResponse, get, web};

use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Serialize, Deserialize)]
pub struct MeResponse {
    first_name: String,
    last_name: String,
    username: String,
    class: Class,
    workout_schedule: Vec<bool>,
}

#[get("/summary/me")]
pub async fn me(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let me_response: MeResponse = sqlx::query_as!(
        MeResponse,
        r#"
            SELECT first_name, last_name, username, class as "class: Class", workout_schedule
            FROM user_info
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(me_response));
}

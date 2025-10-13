use crate::{jwt::AuthenticatedUser, schemas::*};
use actix_web::{HttpResponse, Result, error::ErrorBadRequest, post, web};
use serde::Deserialize;
use sqlx::PgPool;

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

    let query = sqlx::query!(
        r#"
            SELECT user_id 
            FROM user_info 
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
            INSERT INTO user_info (user_id, first_name, last_name, username, class, workout_schedule) 
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        user.id,
        &request.first_name,
        &request.last_name,
        &request.username,
        class as Class,
        &request.workout_schedule,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    let _query = sqlx::query!(
        r#"
            UPDATE users
            SET onboarding_complete = true
            WHERE onboarding_complete = false
        "#,
    );

    return Ok(HttpResponse::Ok().into());
}

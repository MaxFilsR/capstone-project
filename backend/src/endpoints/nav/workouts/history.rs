use crate::jwt::AuthenticatedUser;
use crate::level::add_exp;
use crate::schemas::Exercise;
use crate::schemas::History;
use actix_web::post;
use actix_web::{HttpResponse, Result, error::ErrorBadRequest, error::ErrorNotFound, get, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use sqlx::types::Json;
use sqlx::types::chrono::{
    NaiveDate,
    // NaiveTime,
};

#[derive(Deserialize, Serialize)]
pub struct CreateHistoryRequest {
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
    pub date: NaiveDate,
    // pub time: NaiveTime,
    pub duration: i32,
    pub points: i32,
}

#[post("/workouts/history")]
pub async fn create_history(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateHistoryRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            INSERT INTO history (user_id, name, exercises, date, duration, points)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        user.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
        request.date,
        request.duration,
        request.points,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    let _ = add_exp(&user, &pool, request.points).await.unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct ReadHistoryResponse {
    history: Vec<History>,
}

#[get("/workouts/history")]
pub async fn read_history(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let history: Vec<History> = sqlx::query_as!(
        History,
        r#"
            SELECT id, name, exercises as "exercises: Json<Vec<Exercise>>", date, duration, points
            FROM history
            WHERE user_id = $1
            ORDER BY date DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadHistoryResponse { history: history }));
}

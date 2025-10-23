use crate::jwt::AuthenticatedUser;
use crate::schemas::{Exercise, Routine};
use actix_web::put;
use actix_web::{HttpResponse, Result, delete, error::ErrorBadRequest, get, post, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use sqlx::types::Json;

#[derive(Deserialize, Serialize)]
pub struct CreateRoutinesRequest {
    name: String,
    exercises: Json<Vec<Exercise>>,
    time: i32,
    gainz: i32,
}

#[post("/workout/routines")]
async fn create_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query_as!(
        Routine,
        r#"
            INSERT INTO routines (user_id, name, exercises, time, gainz)
            VALUES ($1, $2, $3, $4, $5)
        "#,
        user.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
        request.time,
        request.gainz,
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct ReadRoutinesResponse {
    routines: Vec<Routine>,
}

#[get("/workout/routines")]
async fn read_routines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let routines: Vec<Routine> = sqlx::query_as!(
        Routine,
        r#"
            SELECT id, name, exercises as "exercises: Json<Vec<Exercise>>", time, gainz
            FROM routines
            where user_id = $1
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadRoutinesResponse { routines: routines }));
}

#[derive(Deserialize, Serialize)]
pub struct UpdateRoutinesRequest {
    id: i32,
    name: String,
    exercises: Json<Vec<Exercise>>,
    time: i32,
    gainz: i32,
}

#[put("/workout/routines")]
async fn update_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            UPDATE routines
            SET name = $3, exercises = $4, time = $5, gainz = $6
            WHERE user_id = $1 AND id = $2
        "#,
        user.id,
        request.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
        request.time,
        request.gainz,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct DeleteRoutinesRequest {
    id: i32,
}

#[delete("/workout/routines")]
async fn delete_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<DeleteRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            DELETE FROM routines
            WHERE user_id = $1 AND id = $2
        "#,
        user.id,
        request.id,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

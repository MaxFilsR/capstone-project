use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, Result, delete, error::ErrorBadRequest, get, post, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Deserialize, Serialize, sqlx::Type)]
pub struct Exercise {
    id: i32,
    sets: i32,
    reps: i32,
    weight: f32,
    distance: f32,
}

#[derive(Deserialize, Serialize)]
pub struct Routine {
    id: i32,
    user_id: i32,
    exercises: Vec<Exercise>,
    time: i32,
    gainz: i32,
}

#[derive(Deserialize, Serialize)]
pub struct GetRoutinesResponse {
    routines: Vec<Routine>,
}

#[get("/workout/routines")]
async fn get_routines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            SELECT id, user_id, exercises, time, gainz
            FROM routines
            where user_id = $1
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    todo!();
}

#[derive(Deserialize, Serialize)]
pub struct PostRoutinesRequest {
    // TODO: add fields
}

#[derive(Deserialize, Serialize)]
pub struct PostRoutinesResponse {
    routines: Vec<Routine>,
}

#[post("/workout/routines")]
async fn post_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<PostRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    todo!();
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
    todo!();
}

use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, Result, delete, error::ErrorBadRequest, get, post, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Deserialize, Serialize)]
pub struct Routine {}

#[derive(Deserialize, Serialize)]
pub struct PostRoutinesResponse {
    routines: Vec<Routine>,
}

#[get("/workout/routines")]
async fn get_routines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    todo!();
}

#[derive(Deserialize, Serialize)]
pub struct PostRoutinesRequest {
    // TODO: add fields
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

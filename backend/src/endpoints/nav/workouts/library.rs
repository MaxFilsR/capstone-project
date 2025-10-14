use actix_web::{HttpResponse, Result, error::ErrorBadRequest, get, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Deserialize, Serialize)]
pub struct LibraryResponse {}

#[get("/workouts/library")]
async fn library(pool: web::Data<PgPool>) -> Result<HttpResponse, actix_web::Error> {
    return Ok(HttpResponse::Ok().json(LibraryResponse {}));
}

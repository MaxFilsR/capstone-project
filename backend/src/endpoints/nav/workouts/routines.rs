use actix_web::{HttpResponse, Result, delete, error::ErrorBadRequest, get, post, web};
use serde::Serialize;
use sqlx::PgPool;

use crate::jwt::AuthenticatedUser;

#[get("/workout/routines")]
async fn get_routines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    // request: web::Json<OnboardingRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    return Ok(HttpResponse::Ok().finish());
}

#[post("/workout/routines")]
async fn post_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    // request: web::Json<OnboardingRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    return Ok(HttpResponse::Ok().finish());
}

#[delete("/workout/routines")]
async fn delete_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    // request: web::Json<OnboardingRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    return Ok(HttpResponse::Ok().finish());
}

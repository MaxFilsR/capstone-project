use actix_web::{HttpResponse, error::ErrorBadRequest, post, web};
use email_address::EmailAddress;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::jwt;

/*
 *  POST /onboarding/personal-info
 */

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct RegisterResponse {
    access_token: String,
    refresh_token: String,
}

#[post("/auth/sign-up")]
async fn sign_up(
    pool: web::Data<PgPool>,
    request: web::Json<RegisterRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    if !EmailAddress::is_valid(&request.email) {
        return Err(ErrorBadRequest("This email is invalid."));
    }

    let query = sqlx::query!(
        r#"
            INSERT INTO users (email, password, onboarding_complete) 
            VALUES ($1, crypt($2, gen_salt('md5')), FALSE)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        "#,
        request.email,
        request.password
    )
    .fetch_optional(pool.get_ref())
    .await
    .unwrap();

    match query {
        Some(query) => {
            let user_id: i32 = query.id;
            let access_token = jwt::generate_jwt(user_id, jwt::TokenType::Access);
            let refresh_token = jwt::generate_jwt(user_id, jwt::TokenType::Refresh);

            return Ok(HttpResponse::Ok().json(RegisterResponse {
                access_token: access_token,
                refresh_token: refresh_token,
            }));
        }
        None => {
            return Err(ErrorBadRequest(
                "This email has already been used to register an account.",
            ));
        }
    };
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    access_token: String,
    refresh_token: String,
    onboarding_complete: bool,
}

#[post("/auth/login")]
pub async fn login(
    pool: web::Data<PgPool>,
    request: web::Json<LoginRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    if !EmailAddress::is_valid(&request.email) {
        return Err(ErrorBadRequest("Invalid email"));
    }

    let query = sqlx::query!(
        r#"
            SELECT id, password = crypt($2, password) AS is_valid, onboarding_complete
            FROM users 
            WHERE email = $1
        "#,
        &request.email,
        &request.password
    )
    .fetch_optional(pool.get_ref())
    .await
    .unwrap();

    match query {
        None => return Err(ErrorBadRequest("No user with this email")),
        Some(query) => {
            let is_valid: bool = query.is_valid.unwrap_or(false);
            if !is_valid {
                return Err(ErrorBadRequest("Incorrect password"));
            }

            let user_id: i32 = query.id;
            let access_token = jwt::generate_jwt(user_id, jwt::TokenType::Access);
            let refresh_token = jwt::generate_jwt(user_id, jwt::TokenType::Refresh);

            return Ok(HttpResponse::Ok().json(LoginResponse {
                access_token: access_token,
                refresh_token: refresh_token,
                onboarding_complete: query.onboarding_complete,
            }));
        }
    }
}

#[derive(Deserialize)]
pub struct RefreshRequest {
    refresh_token: String,
}

#[derive(Serialize)]
pub struct RefreshResponse {
    access_token: String,
}

#[post("/auth/refresh")]
pub async fn refresh(request: web::Json<RefreshRequest>) -> Result<HttpResponse, actix_web::Error> {
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let token_data = decode::<jwt::Claims>(
        &request.refresh_token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    );

    match token_data {
        Ok(data) => {
            if data.claims.token_type != jwt::TokenType::Refresh {
                return Err(ErrorBadRequest("Token is not a refresh token"));
            }
            let user_id = data.claims.sub;
            let access_token = jwt::generate_jwt(user_id, jwt::TokenType::Access);
            return Ok(HttpResponse::Ok().json(RefreshResponse {
                access_token: access_token,
            }));
        }
        Err(_) => return Err(ErrorBadRequest("Token is invalid or expired")),
    }
}

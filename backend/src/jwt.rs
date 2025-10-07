use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header, encode};
use std::env;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct Claims {
    pub sub: i32,   // user ID
    pub exp: usize, // expiration timestamp
    pub token_type: TokenType,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum TokenType {
    Access,
    Refresh,
}

pub fn generate_jwt(user_id: i32, token_type: TokenType) -> String {
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let expiration = match token_type {
        TokenType::Access => Utc::now() + Duration::minutes(15),
        TokenType::Refresh => Utc::now() + Duration::days(30),
    };

    let claims = Claims {
        sub: user_id,
        exp: expiration.timestamp() as usize,
        token_type,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .expect("Failed to create token")
}

use actix_web::{Error, FromRequest, HttpRequest, dev::Payload};
use futures_util::future::{Ready, ready};
use jsonwebtoken::{DecodingKey, Validation, decode};

pub struct AuthenticatedUser(pub i32); // just the user ID

impl FromRequest for AuthenticatedUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|h| h.strip_prefix("Bearer "))
            .map(|s| s.to_owned());

        match token {
            Some(token) => {
                let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
                match decode::<super::jwt::Claims>(
                    &token,
                    &DecodingKey::from_secret(secret.as_bytes()),
                    &Validation::default(),
                ) {
                    Ok(data) => ready(Ok(AuthenticatedUser(data.claims.sub))),
                    Err(_) => ready(Err(actix_web::error::ErrorUnauthorized("Invalid token"))),
                }
            }
            None => ready(Err(actix_web::error::ErrorUnauthorized("Missing token"))),
        }
    }
}

use crate::env;
use actix_web::{Error, FromRequest, HttpRequest, dev::Payload};
use chrono::{Duration, Utc};
use futures_util::future::{Ready, ready};
use jsonwebtoken::{DecodingKey, Validation, decode};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
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
    let jwt_secret_key = env::get_env_var_with_key(env::JWT_SECRET_KEY);

    // Set expiration to 30 days for both Access and Refresh tokens
    let expiration = match token_type {
        TokenType::Access => Utc::now() + Duration::days(30), // Set access token to 30 days
        TokenType::Refresh => Utc::now() + Duration::days(30), // Set refresh token to 30 days
    };

    let claims = Claims {
        sub: user_id,
        exp: expiration.timestamp() as usize,
        token_type,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret_key.as_bytes()),
    )
    .expect("Failed to create token")
}

pub struct AuthenticatedUser {
    pub id: i32,
}

impl FromRequest for AuthenticatedUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let jwt_secret_key = env::get_env_var_with_key(env::JWT_SECRET_KEY);

        let token = req
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|h| h.strip_prefix("Bearer "))
            .to_owned();

        match token {
            Some(token) => {
                dbg!(token);

                match decode::<super::jwt::Claims>(
                    &token,
                    &DecodingKey::from_secret(jwt_secret_key.as_bytes()),
                    &Validation::default(),
                ) {
                    Ok(data) => ready(Ok(AuthenticatedUser {
                        id: data.claims.sub,
                    })),
                    Err(_) => ready(Err(actix_web::error::ErrorUnauthorized("Invalid token"))),
                }
            }
            None => ready(Err(actix_web::error::ErrorUnauthorized("Missing token"))),
        }
    }
}

use {
    crate::utils::env,
    actix_web::{
        Error,
        FromRequest,
        HttpRequest,
        dev::Payload,
    },
    chrono::{
        Duration,
        Utc,
    },
    futures_util::future::{
        Ready,
        ready,
    },
    jsonwebtoken::{
        DecodingKey,
        EncodingKey,
        Header,
        Validation,
        decode,
        encode,
    },
    serde::{
        Deserialize,
        Serialize,
    },
};

static JWT_SECRET_KEY: std::sync::LazyLock<String> =
    std::sync::LazyLock::new(|| env::get_env_var_with_key(env::JWT_SECRET_KEY));

#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub struct Claims {
    pub sub: i32,   // user ID
    pub exp: usize, // expiration timestamp
    pub token_type: TokenType,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Serialize)]
pub enum TokenType {
    Access,
    Refresh,
}

pub fn generate_jwt(user_id: i32, token_type: TokenType) -> String {
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
        &EncodingKey::from_secret(JWT_SECRET_KEY.as_bytes()),
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
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|h| h.strip_prefix("Bearer "))
            .to_owned();

        match token {
            Some(token) => {
                match decode::<super::jwt::Claims>(
                    &token,
                    &DecodingKey::from_secret(JWT_SECRET_KEY.as_bytes()),
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

use actix_cors::Cors;
use actix_web::HttpResponse;
use actix_web::{App, HttpServer, middleware::Logger, post, web};
use capstone_project::endpoints;
use capstone_project::jwt::AuthenticatedUser;
use capstone_project::schemas::{Class, UserInfo, UserInfoRow};
use const_env::from_env;
use env_logger::Env;
use sqlx::PgPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();

    #[from_env]
    const ACTIX_WEB_ADDRESS: &'static str = "localhost";
    #[from_env]
    const ACTIX_WEB_PORT: u16 = 8080;
    #[from_env]
    const DATABASE_URL: &'static str = "postgres://postgres:pass@localhost:5432/gainzdb";

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let pool = PgPool::connect(DATABASE_URL).await.unwrap();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["POST"])
            .allow_any_header();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            // Constants
            .service(endpoints::constants::classes)
            // Auth
            .service(endpoints::auth::sign_up)
            .service(endpoints::auth::login)
            .service(endpoints::auth::refresh)
            // Onboarding
            .service(endpoints::onboarding::onboarding)
    })
    .bind((ACTIX_WEB_ADDRESS, ACTIX_WEB_PORT))?
    .run()
    .await
}

pub struct MeResponse {
    first_name: String,
    last_name: String,
    username: String,
    class: Class,
    workout_schedule: Vec<bool>,
}

#[post("/me")]
pub async fn me(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let user_info: UserInfo = sqlx::query_as!(
        UserInfo,
        r#"
            SELECT first_name, last_name, username, class as "class: Class", workout_schedule
            FROM user_info
            where user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(user_info));
}

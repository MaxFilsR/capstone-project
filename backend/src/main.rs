use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger, web};
use capstone_project::endpoints;
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
            .allowed_methods(vec!["DELETE", "GET", "POST"])
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
            // Summary
            .service(endpoints::nav::summary::me)
            // Workouts
            // Library
            .service(endpoints::nav::workouts::library::library)
            // History
            .service(endpoints::nav::workouts::history::get_workout_history)
            .service(endpoints::nav::workouts::history::get_workout_detail)
    })
    .bind((ACTIX_WEB_ADDRESS, ACTIX_WEB_PORT))?
    .run()
    .await
}

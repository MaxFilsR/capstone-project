use const_env::from_env;

use actix_web::{App, HttpServer, web};
use capstone_project::endpoints;
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

    println!("Starting web sever at http://{ACTIX_WEB_ADDRESS}:{ACTIX_WEB_PORT}");

    let pool = PgPool::connect(DATABASE_URL).await.unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            // Constants
            .service(endpoints::constants::classes)
            // Auth
            .service(endpoints::auth::sign_up)
            .service(endpoints::auth::login)
            .service(endpoints::auth::refresh)
            // Onboarding
            .service(endpoints::onboarding::user_info)
    })
    .bind((ACTIX_WEB_ADDRESS, ACTIX_WEB_PORT))?
    .run()
    .await
}

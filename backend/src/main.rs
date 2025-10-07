use actix_web::{App, HttpServer, web};
use capstone_project::endpoints;
use sqlx::PgPool;

const ADDRESS: &str = "127.0.0.1";
const PORT: u16 = 8080;
const DATABASE_URL: &str = "postgres://localhost:5432";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting web sever at http://{ADDRESS}:{PORT}");

    let pool = PgPool::connect(DATABASE_URL).await.unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            // Auth
            .service(endpoints::auth::register)
            .service(endpoints::auth::login)
            .service(endpoints::auth::refresh)
            // Onboarding
            .service(endpoints::onboarding::class)
            .service(endpoints::onboarding::check_username)
            .service(endpoints::onboarding::workout_schedule)
    })
    .bind((ADDRESS, PORT))?
    .run()
    .await
}

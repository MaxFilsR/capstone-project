use actix_web::{App, HttpServer};
// use capstone_project::db;
use capstone_project::nav;

const ADDRESS: &str = "127.0.0.1";
const PORT: u16 = 8080;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting web sever at http://{ADDRESS}:{PORT}");
    HttpServer::new(|| {
        App::new()
            // Onboarding
            .service(nav::onboarding::personal_info)
            .service(nav::onboarding::class)
            .service(nav::onboarding::check_username)
            .service(nav::onboarding::authentication)
            .service(nav::onboarding::character)
        // ...
    })
    .bind((ADDRESS, PORT))?
    .run()
    .await
}

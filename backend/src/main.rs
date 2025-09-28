use actix_web::{App, HttpServer};
use capstone_project::nav;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
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
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

use actix_cors::Cors;
use actix_web::{App, HttpServer, cookie::time::format_description::well_known::iso8601::Config, middleware::Logger, web};
use capstone_project::endpoints;
use dotenvy::dotenv;
use env_logger::Env;
use sqlx::PgPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // const ACTIX_WEB_ADDRESS: &'static str = "0.0.0.0";
    // const ACTIX_WEB_ADDRESS: &str =
    //     &*std::env::var("ACTIX_WEB_ADDRESS").expect("ACTIX_WEB_ADDRESS must be set");
    // dbg!(ACTIX_WEB_ADDRESS);
    // const ACTIX_WEB_PORT: u16 = std::env::var("ACTIX_WEB_PORT")
    //     .expect("ACTIX_WEB_PORT must be set")
    //     .parse()
    //     .unwrap();
    // dbg!(ACTIX_WEB_PORT);
    // const DATABASE_URL: &str = &*std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    // dbg!(DATABASE_URL);
    
    dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await?;


    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["DELETE", "GET", "POST", "PUT"])
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
            .service(endpoints::auth::healthpoint)
            // Onboarding
            .service(endpoints::onboarding::onboarding)
            // Summary
            .service(endpoints::nav::summary::me)
            // Workouts
            .service(endpoints::nav::workouts::history::create_history)
            .service(endpoints::nav::workouts::history::read_history)
            .service(endpoints::nav::workouts::library::library)
            .service(endpoints::nav::workouts::routines::create_rotuines)
            .service(endpoints::nav::workouts::routines::delete_rotuines)
            .service(endpoints::nav::workouts::routines::read_routines)
            .service(endpoints::nav::workouts::routines::update_rotuines)
    })
    .bind((ACTIX_WEB_ADDRESS, ACTIX_WEB_PORT))?
    .run()
    .await?;

    Ok(())
}

use actix_cors::Cors;
use actix_web::{
    App, HttpServer, cookie::time::format_description::well_known::iso8601::Config,
    middleware::Logger, web,
};
use capstone_project::endpoints;
use dotenvy::dotenv;
use env_logger::Env;
use sqlx::PgPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    
    let actix_web_address =
        &*std::env::var("ACTIX_WEB_ADDRESS").expect("ACTIX_WEB_ADDRESS must be set");
    dbg!(actix_web_address);
    let actix_web_port: u16 = std::env::var("ACTIX_WEB_PORT")
        .expect("ACTIX_WEB_PORT must be set")
        .parse()
        .unwrap();
    dbg!(actix_web_port);
    let database_url = &*std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    dbg!(database_url);


    let pool = PgPool::connect(database_url).await.unwrap();

    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => println!("Migrations executed successfully."),
        Err(e) => eprintln!("Error executing migrations: {}", e),
    };

    println!(
        "{}", 
        format!("Server is running on https://localhost:{}", actix_web_port)
    );

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
            // Character
            .service(endpoints::nav::character::read_character)
            // Workouts
            .service(endpoints::nav::workouts::history::create_history)
            .service(endpoints::nav::workouts::history::read_history)
            .service(endpoints::nav::workouts::library::library)
            .service(endpoints::nav::workouts::routines::create_rotuines)
            .service(endpoints::nav::workouts::routines::delete_rotuines)
            .service(endpoints::nav::workouts::routines::read_routines)
            .service(endpoints::nav::workouts::routines::update_rotuines)
    })
    .bind((actix_web_address, actix_web_port))?
    .run()
    .await?;

    Ok(())
}

use actix_cors::Cors;
use actix_web::{
    App, HttpServer,
    cookie::time::format_description::well_known::iso8601::Config,
    middleware::Logger,
    test,
    web::{self, get},
};
use capstone_project::{endpoints, env};
use env_logger::Env;
use sqlx::PgPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let actix_web_address = env::get_env_var_with_key(env::ACTIX_WEB_ADDRESS);
    let actix_web_port = env::get_env_var_with_key(env::ACTIX_WEB_PORT);
    let database_url = env::get_env_var_with_key(env::DATABASE_URL);

    let pool = PgPool::connect(&database_url).await.unwrap();

    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => println!("Migrations executed successfully."),
        Err(e) => eprintln!("Error executing migrations: {}", e),
    };

    println!("Server is running on https://localhost:{actix_web_port}");

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
            // Stats
            .service(endpoints::stats::increase_stat)
            // Social
            .service(endpoints::nav::social::read_friends)
            .service(endpoints::nav::social::read_friend_detail)
            .service(endpoints::nav::social::update_friends)
    })
    .bind(format!("{actix_web_address}:{actix_web_port}"))?
    .run()
    .await?;

    Ok(())
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use actix_web::{http::StatusCode, test, App};
//     use capstone_project::endpoints::auth::sign_up;

//     #[actix_web::test]
//     async fn test_signup() {
//         let app = test::init_service(App::new().service(sign_up)).await;

//         let request = test::TestRequest::post().uri("/auth/sign-up").to_request();

//         let response = test::call_service(&app, request).await;

//         assert_eq!(response.status(), StatusCode::OK);

//     }
// }

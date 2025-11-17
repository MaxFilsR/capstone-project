use {
    actix_cors::Cors,
    actix_web::{
        App,
        HttpServer,
        middleware::Logger,
        web,
    },
    capstone_project::{
        endpoints,
        env,
    },
    env_logger::Env,
    sqlx::PgPool,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(
        Env::default()
            .default_filter_or("info")
            .default_write_style_or("auto"),
    );

    let actix_web_address = env::get_env_var_with_key(env::ACTIX_WEB_ADDRESS);
    let actix_web_port = env::get_env_var_with_key(env::ACTIX_WEB_PORT);
    let database_url = env::get_env_var_with_key(env::DATABASE_URL);

    let pool = PgPool::connect(&database_url).await.unwrap();

    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => log::info!("Migrations executed successfully."),
        Err(e) => log::error!("Error executing migrations: {}", e),
    };

    log::info!("Server is running on https://localhost:{actix_web_port}");

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
            // Quests
            .service(endpoints::nav::quests::read_quests)
            .service(endpoints::nav::quests::create_quest)
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
            .service(endpoints::nav::social::read_leaderboard)
            .service(endpoints::nav::social::read_leaderboard_detail)
    })
    .bind(format!("{actix_web_address}:{actix_web_port}"))?
    .run()
    .await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    // use {
    //     super::*,
    //     actix_web::{
    //         App,
    //         http::StatusCode,
    //         test,
    //     },
    //     capstone_project::endpoints::auth::sign_up,
    // };

    // #[actix_web::test]
    // async fn test_signup() {
    //     let app = test::init_service(App::new().service(sign_up)).await;

    //     let request = test::TestRequest::post().uri("/auth/sign-up").to_request();

    //     let response = test::call_service(&app, request).await;

    //     assert_eq!(response.status(), StatusCode::OK);
    // }
}

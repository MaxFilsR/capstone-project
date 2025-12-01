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
        utils::env,
    },
    env_logger::Env,
    sqlx::PgPool,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(
        Env::default()
            .default_filter_or(log::Level::Info.as_str())
            .default_write_style_or("auto"),
    );

    let actix_web_address = env::get_env_var_from_key(env::ACTIX_WEB_ADDRESS);
    let actix_web_port = env::get_env_var_from_key(env::ACTIX_WEB_PORT);
    let database_url = env::get_env_var_from_key(env::DATABASE_URL);

    let pool = PgPool::connect(&database_url).await.unwrap();

    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => log::info!("Migrations executed successfully."),
        Err(e) => log::error!("Error executing migrations: {}", e),
    };

    add_default_user(&pool).await;

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            // Constants
            .service(endpoints::constants::classes::classes)
            .service(endpoints::constants::items::items)
            // Auth
            .service(endpoints::auth::sign_up)
            .service(endpoints::auth::login)
            .service(endpoints::auth::refresh)
            .service(endpoints::auth::healthpoint)
            // Onboarding
            .service(endpoints::onboarding::onboarding)
            // Character
            .service(endpoints::nav::character::read_character)
            .service(endpoints::nav::character::read_inventory)
            .service(endpoints::nav::character::update_inventory)
            .service(endpoints::nav::character::read_equipped)
            .service(endpoints::nav::character::update_equipped)
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
            .service(endpoints::nav::social::send_friend_request)
            .service(endpoints::nav::social::get_incoming_requests)
            .service(endpoints::nav::social::get_outgoing_requests)
            .service(endpoints::nav::social::respond_to_request)
            .service(endpoints::nav::social::remove_friend)
            // Settings
            .service(endpoints::settings::update_username)
            .service(endpoints::settings::update_name)
            .service(endpoints::settings::update_workout_schedule)
            .service(endpoints::settings::update_email)
            .service(endpoints::settings::update_class)
    })
    .bind(format!("{actix_web_address}:{actix_web_port}"))?
    .run()
    .await?;

    log::info!("Server is running on https://localhost:{actix_web_port}");

    Ok(())
}

async fn add_default_user(pool: &PgPool) {
    let _query = sqlx::query!(
        r#"
            INSERT INTO users (email, password, onboarding_complete)
            VALUES ('you@example.com', crypt ('12345678', gen_salt ('md5')), TRUE);
        "#
    )
    .execute(pool)
    .await
    .unwrap();

    let _query = sqlx::query!(
        r#"
            INSERT INTO settings (user_id, first_name, last_name, workout_schedule)
            VALUES (1, 'John', 'Doe', '{TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE}');
        "#
    )
    .execute(pool)
    .await
    .unwrap();

    let inventory = endpoints::onboarding::populate_inventory(pool).await;
    let equipped = endpoints::onboarding::populate_equipped(&inventory);

    let _query = sqlx::query!(
        r#"
            INSERT INTO characters (
                user_id,
                username,
                class,
                level,
                exp_leftover,
                pending_stat_points,
                streak,
                coins,
                equipped,
                inventory,
                friends
            )
            VALUES (
                1,
                'JDoe',
                ROW ('Warrior', ROW (10, 7, 5)),
                1,
                0,
                0,
                0,
                1000,
                $1,
    		    $2,
                '{}'
            )
        "#,
        equipped as capstone_project::utils::schemas::Equipped,
        inventory as capstone_project::utils::schemas::Inventory,
    )
    .execute(pool)
    .await
    .unwrap();
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

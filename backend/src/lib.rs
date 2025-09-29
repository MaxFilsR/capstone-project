pub mod nav {
    use actix_web::scope;

    #[scope("/character")]
    pub mod character {
        include!("nav/character.rs");
    }

    #[scope("/onboarding")]
    pub mod onboarding {
        include!("nav/onboarding.rs");
    }

    #[scope("/quests")]
    pub mod quests {
        include!("nav/quests.rs");
    }

    #[scope("/social")]
    pub mod social {
        include!("nav/social.rs");
    }

    #[scope("/summary")]
    pub mod summary {
        include!("nav/summary.rs");
    }

    #[scope("/workouts")]
    pub mod workouts {
        include!("nav/workouts.rs");
    }
}

// Example

// #[get("...")]
// async fn check_username() -> impl Responder {
//     HttpResponse::Ok().body("Hello world!")
// }

// #[post("...")]
// async fn authentication(req_body: String) -> impl Responder {
//     HttpResponse::Ok().body(req_body)
// }

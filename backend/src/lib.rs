pub mod nav {
    pub mod character;
    pub mod onboarding;
    pub mod quests;
    pub mod social;
    pub mod summary;
    pub mod workouts;
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

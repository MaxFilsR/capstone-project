use actix_web::{App, HttpResponse, HttpServer, Responder, get, post, web};

#[post("/onboarding/personal-info")]
async fn personal_info() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/onboarding/class")]
async fn class(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[get("/onboarding/check-username")]
async fn check_username(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[post("/onboarding/authentication")]
async fn authentication(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[post("/onboarding/character")]
async fn character(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

use actix_web::{HttpResponse, Responder, body, get, post};

#[post("/onboarding/personal-info")]
async fn personal_info() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/onboarding/class")]
async fn class(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[get("/onboarding/check-username")]
async fn check_username() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/onboarding/authentication")]
async fn authentication(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/onboarding/character")]
async fn character(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

use actix_web::{HttpResponse, Responder, get, post};

#[post("/personal-info")]
async fn personal_info() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/class")]
async fn class(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[get("/check-username")]
async fn check_username() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/authentication")]
async fn authentication(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[post("/character")]
async fn character(req_body: String) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

use actix_web::{HttpResponse, Responder, get, post, web};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
struct PersonalInfoRequest {
    first_name: String,
    last_name: String,
    email: String,
    password: String,
}

#[derive(Serialize)]
struct PersonalInfoResponse {
    temp_token: String,
    user_id: Uuid,
}

#[post("/onboarding/personal-info")]
async fn personal_info(request: web::Form<PersonalInfoRequest>) -> impl Responder {
    return HttpResponse::Ok().json(PersonalInfoResponse {
        temp_token: "test".to_string(),
        user_id: Uuid::new_v4(),
    });
}
#[derive(Deserialize)]
struct ClassRequest {
    class: String,
}

#[derive(Serialize)]
struct ClassResponse {
    user_id: Uuid,
    class: String,
}

#[post("/onboarding/class")]
async fn class(request: web::Form<ClassRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[derive(Serialize)]
struct CheckUsernameResponse {
    username: String,
    available: bool,
}

#[get("/onboarding/check-username")]
async fn check_username() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[derive(Deserialize)]
struct AuthenticationRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
struct AuthenticationResponse {
    user_id: Uuid,
    username: String,
}

#[post("/onboarding/authentication")]
async fn authentication(request: web::Form<AuthenticationRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

#[derive(Deserialize)]
struct CharacterRequest {
    workout_schedule: [bool; 7],
    class: String,
}

#[derive(Serialize)]
enum Status {
    Active,
    Inactive,
}

#[derive(Serialize)]
struct Profile {
    first_name: String,
    last_name: String,
    username: String,
    class: String,
    workout_schedule: [bool; 7],
}

#[derive(Serialize)]
struct CharacterResponse {
    user_id: Uuid,
    status: Status,
    profile: Profile,
}

#[post("/onboarding/character")]
async fn character(request: web::Form<CharacterRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

use actix_web::{HttpResponse, Responder, get, post, web};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// POST /onboarding/personal-info

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

// POST /onboarding/class

#[derive(Deserialize)]
struct ClassRequest {
    class: String,
}

#[post("/onboarding/class")]
async fn class(request: web::Form<ClassRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

// GET /onboarding/check-username

#[derive(Serialize)]
struct CheckUsernameResponse {
    available: bool,
}

#[get("/onboarding/check-username")]
async fn check_username() -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

// POST /onboarding/authentication

#[derive(Deserialize)]
struct AuthenticationRequest {
    username: String,
    password: String,
}

#[post("/onboarding/authentication")]
async fn authentication(request: web::Form<AuthenticationRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

// POST /onboarding/workout-schedule

#[derive(Deserialize)]
struct WorkoutScheduleRequest {
    workout_schedule: [bool; 7],
}

#[post("/onboarding/workout-schedule")]
async fn workout_schedule(request: web::Form<WorkoutScheduleRequest>) -> impl Responder {
    todo!();
    return HttpResponse::NotImplemented();
}

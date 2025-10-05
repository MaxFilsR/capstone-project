use actix_web::{
    HttpResponse, post,
    web::{Form, Json},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db;

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
async fn personal_info(request: Form<PersonalInfoRequest>) -> Json<PersonalInfoResponse> {
    return Json(PersonalInfoResponse {
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
async fn class(request: Form<ClassRequest>) -> HttpResponse {
    todo!();
    return HttpResponse::Ok().into();
}

// POST /onboarding/check-username

#[derive(Deserialize)]
struct CheckUsernameRequest {
    username: String,
}

#[derive(Serialize)]
struct CheckUsernameResponse {
    available: bool,
}

#[post("/onboarding/check-username")]
async fn check_username(request: Form<CheckUsernameRequest>) -> Json<CheckUsernameResponse> {
    return Json(CheckUsernameResponse { available: true });
}

// POST /onboarding/authentication

#[derive(Deserialize)]
struct AuthenticationRequest {
    username: String,
    password: String,
}

#[post("/onboarding/authentication")]
async fn authentication(request: Form<AuthenticationRequest>) -> HttpResponse {
    let mut connection = db::connect().await;
    let row = sqlx::query("FROM users SELECT password WHERE username = '$1' ")
        .bind(&request.username)
        .fetch_one(&mut connection)
        .await
        .unwrap();

    let result = "...";

    if request.password == result {
        return HttpResponse::Ok().into();
    } else {
        return HttpResponse::NotFound().into();
    }
}

// POST /onboarding/workout-schedule

#[derive(Deserialize)]
struct WorkoutScheduleRequest {
    workout_schedule: [bool; 7],
}

#[post("/onboarding/workout-schedule")]
async fn workout_schedule(request: Form<WorkoutScheduleRequest>) -> HttpResponse {
    todo!();
    return HttpResponse::NotImplemented().into();
}

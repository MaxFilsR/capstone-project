use actix_web::{
    HttpResponse, post,
    web::{Form, Json},
};
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};
use sqlx::Row;

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
    successful: bool,
    error: String,
}

#[post("/onboarding/personal-info")]
async fn personal_info(request: Form<PersonalInfoRequest>) -> Json<PersonalInfoResponse> {
    let mut connection = db::connect().await;

    fn hash(unhashed: &str) -> &str {
        todo!();
    }

    let (succesful, error) = if !EmailAddress::is_valid(&request.email) {
        (false, "email is invalid")
    } else {
        let query = sqlx::query(
            "INSERT INTO users (first_name,last_name,email,password) VALUES
             ($1,$2,$3,$4)
             ON CONFLICT (email) DO NOTHING",
        )
        .bind(&request.first_name)
        .bind(&request.last_name)
        .bind(&request.email)
        .bind(hash(&request.password))
        .execute(&mut connection)
        .await
        .unwrap();

        if query.rows_affected() == 0 {
            (false, "email already exists")
        } else {
            (true, "")
        }
    };

    return Json(PersonalInfoResponse {
        successful: succesful,
        error: error.to_string(),
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
    let mut connection = db::connect().await;

    let query = sqlx::query(
        "FROM users SELECT id 
         WHERE username = '$1'",
    )
    .bind(&request.username)
    .fetch_optional(&mut connection)
    .await
    .unwrap();

    return Json(CheckUsernameResponse {
        available: query.is_some(),
    });
}

// POST /onboarding/authentication

#[derive(Deserialize)]
struct AuthenticationRequest {
    username: String,
    password: String,
}

#[derive(Serialize)]
struct AuthenticationResponse {
    authenticated: bool,
}

#[post("/onboarding/authentication")]
async fn authentication(request: Form<AuthenticationRequest>) -> Json<AuthenticationResponse> {
    let mut connection = db::connect().await;

    let query = sqlx::query(
        "FROM users SELECT password 
         WHERE username = '$1'",
    )
    .bind(&request.username)
    .fetch_one(&mut connection)
    .await
    .unwrap();

    let password: String = query.try_get("password").unwrap();

    return Json(AuthenticationResponse {
        authenticated: request.password == password,
    });
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

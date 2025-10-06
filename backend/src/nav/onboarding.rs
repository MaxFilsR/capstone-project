use actix_web::{
    HttpResponse, Result,
    error::ErrorBadRequest,
    post,
    web::{self, Json},
};
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use strum::Display;

/*
 *  POST /onboarding/personal-info
 */

#[derive(Deserialize)]
struct PersonalInfoRequest {
    first_name: String,
    last_name: String,
    email: String,
    password: String,
}

#[post("/onboarding/personal-info")]
async fn personal_info(
    pool: web::Data<PgPool>,
    request: Json<PersonalInfoRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    fn hash(unhashed: &str) -> &str {
        todo!();
    }

    if !EmailAddress::is_valid(&request.email) {
        return Err(ErrorBadRequest("This email is invalid."));
    } else {
        let query = sqlx::query(
            "INSERT INTO users (first_name,last_name,email,password) 
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (email) DO NOTHING",
        )
        .bind(&request.first_name)
        .bind(&request.last_name)
        .bind(&request.email)
        .bind(hash(&request.password))
        .execute(pool.get_ref())
        .await
        .unwrap();

        if query.rows_affected() == 0 {
            return Err(ErrorBadRequest(
                "This email has already been used to register an account.",
            ));
        } else {
            return Ok(HttpResponse::Ok().finish());
        }
    };
}

/*
 *  POST /onboarding/class
 */

#[derive(Deserialize)]
pub struct Stats {
    vitality: i16,
    strength: i16,
    endurance: i16,
    agility: i16,
}

impl Stats {
    pub const ASSASIN: Stats = Stats {
        vitality: 2,
        strength: 0,
        endurance: 0,
        agility: 2,
    };
    pub const GLADIATOR: Stats = Stats {
        vitality: 2,
        strength: 0,
        endurance: 2,
        agility: 0,
    };
    pub const MONK: Stats = Stats {
        vitality: 1,
        strength: 0,
        endurance: 1,
        agility: 2,
    };
    pub const WARRIOR: Stats = Stats {
        vitality: 2,
        strength: 2,
        endurance: 0,
        agility: 0,
    };
    pub const WIZARD: Stats = Stats {
        vitality: 1,
        strength: 1,
        endurance: 1,
        agility: 1,
    };
}

#[derive(Deserialize, Display, Clone, Copy)]
pub enum ClassType {
    // Class::ClassType
    Assasin,
    Gladiator,
    Monk,
    Warrior,
    Wizard,
}

#[derive(Deserialize)]
struct Class {
    class_type: ClassType,
    stats: Stats,
}

impl Class {
    fn new(class_type: ClassType) -> Self {
        Self {
            class_type: class_type,
            stats: match class_type {
                ClassType::Assasin => Stats::ASSASIN,
                ClassType::Gladiator => Stats::GLADIATOR,
                ClassType::Monk => Stats::MONK,
                ClassType::Warrior => Stats::WARRIOR,
                ClassType::Wizard => Stats::WIZARD,
            },
        }
    }

    fn with_stats(class_type: ClassType, stats: Stats) -> Self {
        Self {
            class_type: class_type,
            stats: stats,
        }
    }
}

#[derive(Deserialize)]
struct ClassRequest {
    class_type: ClassType,
}

#[post("/onboarding/class")]
async fn class(
    pool: web::Data<PgPool>,
    request: Json<ClassRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let class = Class::new(request.class_type);
    let _query = sqlx::query(
        "INSERT INTO users (class) 
         VALUES (ROW($1, ROW($2,$3,$4,$5)))
         WHERE id = $6", //TODO: based on JWT
    )
    .bind(class.class_type.to_string())
    .bind(class.stats.vitality)
    .bind(class.stats.strength)
    .bind(class.stats.endurance)
    .bind(class.stats.agility)
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}

/*
 * POST /onboarding/check-username
 */

#[derive(Deserialize)]
struct CheckUsernameRequest {
    username: String,
}

#[post("/onboarding/check-username")]
async fn check_username(
    pool: web::Data<PgPool>,
    request: Json<CheckUsernameRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query(
        "FROM users SELECT id 
         WHERE username = '$1'",
    )
    .bind(&request.username)
    .fetch_optional(pool.get_ref())
    .await
    .unwrap();

    match query {
        Some(_) => return Ok(HttpResponse::Ok().into()),
        None => return Err(ErrorBadRequest("This username is already taken")),
    }
}

/*
 * POST /onboarding/workout-schedule
 */

#[derive(Deserialize)]
struct WorkoutScheduleRequest {
    workout_schedule: [bool; 7],
}

#[post("/onboarding/workout-schedule")]
async fn workout_schedule(
    pool: web::Data<PgPool>,
    request: Json<WorkoutScheduleRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query(
        "INSERT INTO users (workout_schedule) 
         VALUES ($1)
         WHERE id = $2",
    )
    .bind(&request.workout_schedule)
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}

/*
 *  POST /onboarding/authentication
 */

#[derive(Deserialize)]
struct AuthenticationRequest {
    username: String,
    password: String,
}

#[post("/onboarding/authentication")]
async fn authentication(
    pool: web::Data<PgPool>,
    request: Json<AuthenticationRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query(
        "FROM users SELECT password 
         WHERE username = '$1'",
    )
    .bind(&request.username)
    .fetch_one(pool.get_ref())
    .await;

    match query {
        Ok(query) => {
            let password: String = query.try_get("password").unwrap();
            if request.password == password {
                return Ok(HttpResponse::Ok().into());
            } else {
                return Err(ErrorBadRequest("Incorrect Password"));
            }
        }
        Err(_) => Err(ErrorBadRequest("No such user")),
    }
}

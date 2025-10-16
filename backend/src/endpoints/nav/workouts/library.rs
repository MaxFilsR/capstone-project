use std::fs;

use actix_web::{HttpResponse, Result, error::ErrorBadRequest, get, web};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Exercise {
    id: String,
    name: String,
    force: Option<String>,
    level: String,
    mechanic: Option<String>,
    equipment: Option<String>,
    primaryMuscles: Vec<String>,
    secondaryMuscles: Vec<String>,
    instructions: Vec<String>,
    category: String,
    images: Vec<String>,
}

#[get("/workouts/library")]
async fn library() -> Result<HttpResponse, actix_web::Error> {
    let file_path = "./db/exercises.json";

    let file_content = web::block(move || fs::read_to_string(file_path))
        .await?
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    let exercises: Vec<Exercise> = serde_json::from_str(&file_content)
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    return Ok(HttpResponse::Ok().json(exercises));
}

use std::fs;

use {
    actix_web::{
        HttpResponse,
        Result,
        get,
        web,
    },
    serde::{
        Deserialize,
        Serialize,
    },
};

#[derive(Deserialize, Serialize)]
#[allow(non_snake_case)]
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
    let file_path = "/app/exercises.json";

    let file_content = web::block(move || fs::read_to_string(file_path))
        .await?
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let exercises: Vec<Exercise> = serde_json::from_str(&file_content)
        .map_err(actix_web::error::ErrorInternalServerError)?;

    return Ok(HttpResponse::Ok().json(exercises));
}

use {
    crate::utils::{
        jwt::AuthenticatedUser,
        schemas::*,
    },
    actix_web::{
        HttpResponse,
        Result,
        error::ErrorBadRequest,
        post,
        web,
    },
    serde::Deserialize,
    sqlx::PgPool,
};


#[derive(Deserialize)]
struct UpdateUsernameRequest {
    username: String,
}

#[derive(Deserialize)]
struct UpdateNameRequest {
    first_name: String,
    last_name: String,
}

#[derive(Deserialize)]
struct UpdateWorkoutScheduleRequest {
    workout_schedule: [bool; 7],
}

#[derive(Deserialize)]
struct UpdateEmailRequest {
    email: String,
}

// Update username 
#[post("/settings/username")]
async fn update_username(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateUsernameRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // Check if username is already taken
    let existing_user = sqlx::query!(
        r#"
            SELECT user_id 
            FROM characters 
            WHERE username = $1 AND user_id != $2
        "#,
        request.username,
        user.id
    )
    .fetch_optional(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Database error: {}", e)))?;

    if existing_user.is_some() {
        return Err(ErrorBadRequest("This username is already taken"));
    }

    // Update username in characters table
    sqlx::query!(
        r#"
            UPDATE characters
            SET username = $1
            WHERE user_id = $2
        "#,
        request.username,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update username: {}", e)))?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Username updated successfully"
    })))
}

// Update first and last name 
#[post("/settings/name")]
async fn update_name(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateNameRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    sqlx::query!(
        r#"
            UPDATE settings
            SET first_name = $1, last_name = $2
            WHERE user_id = $3
        "#,
        request.first_name,
        request.last_name,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update name: {}", e)))?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Name updated successfully"
    })))
}

// Update workout schedule 
#[post("/settings/workout-schedule")]
async fn update_workout_schedule(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateWorkoutScheduleRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    sqlx::query!(
        r#"
            UPDATE settings
            SET workout_schedule = $1
            WHERE user_id = $2
        "#,
        &request.workout_schedule,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update workout schedule: {}", e)))?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Workout schedule updated successfully"
    })))
}

// Update email 
#[post("/settings/email")]
async fn update_email(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateEmailRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // Check if email is already taken
    let existing_user = sqlx::query!(
        r#"
            SELECT id 
            FROM users 
            WHERE email = $1 AND id != $2
        "#,
        request.email,
        user.id
    )
    .fetch_optional(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Database error: {}", e)))?;

    if existing_user.is_some() {
        return Err(ErrorBadRequest("This email is already in use"));
    }

    // Update email in users table
    sqlx::query!(
        r#"
            UPDATE users
            SET email = $1
            WHERE id = $2
        "#,
        request.email,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update email: {}", e)))?;
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Email updated successfully"
    })))
}
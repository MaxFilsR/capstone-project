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

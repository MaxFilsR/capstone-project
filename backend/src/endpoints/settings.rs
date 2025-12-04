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
    email_address::EmailAddress,
    once_cell::sync::Lazy,
    serde::Deserialize,
    sqlx::PgPool,
    std::collections::HashMap,
};

// Define base stats for each class so it can be referenced during class updates
static BASE_CLASS_STATS: Lazy<HashMap<i32, (&'static str, Stats)>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(
        1,
        (
            "Warrior",
            Stats {
                strength: 10,
                endurance: 7,
                flexibility: 5,
            },
        ),
    );
    m.insert(
        2,
        (
            "Monk",
            Stats {
                strength: 4,
                endurance: 7,
                flexibility: 10,
            },
        ),
    );
    m.insert(
        3,
        (
            "Assassin",
            Stats {
                strength: 5,
                endurance: 10,
                flexibility: 6,
            },
        ),
    );
    m.insert(
        4,
        (
            "Wizard",
            Stats {
                strength: 7,
                endurance: 7,
                flexibility: 7,
            },
        ),
    );
    m.insert(
        5,
        (
            "Gladiator",
            Stats {
                strength: 6,
                endurance: 5,
                flexibility: 5,
            },
        ),
    );
    m
});

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

#[derive(Deserialize)]
struct UpdateClassRequest {
    class_id: i32,
}

#[derive(Deserialize)]
struct UpdatePasswordRequest {
    current_password: String,
    new_password: String,
}

// Update username
#[post("/settings/username")]
async fn update_username(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateUsernameRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // Make sure username is not empty
    if request.username.is_empty() {
        return Err(ErrorBadRequest("Username cannot be empty"));
    }

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
    // make sure names are not empty
    if request.first_name.is_empty() || request.last_name.is_empty() {
        return Err(ErrorBadRequest("First and last name cannot be empty"));
    }

    // Update names in settings table
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
    // Validate email format
    if !EmailAddress::is_valid(&request.email) {
        return Err(ErrorBadRequest("This email is invalid"));
    }

    // Check if email is already taken since it needs to be unique
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

// Update character class
#[post("/settings/class")]
async fn update_class(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateClassRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // Validate class_id exists and get new class base stats from static
    let (new_class_name, new_base) = BASE_CLASS_STATS
        .get(&request.class_id)
        .ok_or_else(|| ErrorBadRequest("Invalid class_id"))?;

    // Get current character class from table
    let character = sqlx::query!(
        r#"
            SELECT class as "class: Class"
            FROM characters
            WHERE user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to fetch character: {}", e)))?;

    // Get old class base stats from static
    let old_base = BASE_CLASS_STATS
        .values()
        .find(|(name, _)| *name == character.class.name.as_str())
        .map(|(_, stats)| stats)
        .ok_or_else(|| ErrorBadRequest("Current class not found"))?;

    // Calculate earned stats (current stats - old base stats)
    let earned_strength = character.class.stats.strength - old_base.strength;
    let earned_endurance = character.class.stats.endurance - old_base.endurance;
    let earned_flexibility = character.class.stats.flexibility - old_base.flexibility;

    // Apply earned stats to new class base stats
    let updated_class = Class {
        name: new_class_name.to_string(),
        stats: Stats {
            strength: new_base.strength + earned_strength,
            endurance: new_base.endurance + earned_endurance,
            flexibility: new_base.flexibility + earned_flexibility,
        },
    };

    // Update character with new class
    sqlx::query!(
        r#"
            UPDATE characters
            SET class = ROW($1, ROW($2, $3, $4))::class
            WHERE user_id = $5
        "#,
        updated_class.name,
        updated_class.stats.strength,
        updated_class.stats.endurance,
        updated_class.stats.flexibility,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update class: {}", e)))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Class updated successfully"
    })))
}

// Update password 
#[post("/settings/password")]
async fn update_password(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdatePasswordRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    // Validate new password length
    if request.new_password.len() < 8 {
        return Err(ErrorBadRequest("New password must be at least 8 characters"));
    }

    // Verify current password using PostgreSQL's crypt
    let verification = sqlx::query!(
        r#"
            SELECT password = crypt($1, password) AS is_valid
            FROM users
            WHERE id = $2
        "#,
        request.current_password,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to verify password: {}", e)))?;

    let is_valid = verification.is_valid.unwrap_or(false);
    if !is_valid {
        return Err(ErrorBadRequest("Current password is incorrect"));
    }

    // Update password using PostgreSQL's crypt with MD5 salt
    sqlx::query!(
        r#"
            UPDATE users
            SET password = crypt($1, gen_salt('md5'))
            WHERE id = $2
        "#,
        request.new_password,
        user.id
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| ErrorBadRequest(format!("Failed to update password: {}", e)))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Password updated successfully"
    })))
}
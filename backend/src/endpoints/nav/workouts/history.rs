use crate::jwt::AuthenticatedUser;
use crate::schemas::Exercise;
use crate::schemas::History;
use actix_web::post;
use actix_web::{HttpResponse, Result, error::ErrorBadRequest, error::ErrorNotFound, get, web};
use serde::{Deserialize, Serialize};
use sqlx::types::Json;
use sqlx::types::chrono::NaiveDate;
use sqlx::types::chrono::NaiveTime;
use sqlx::{FromRow, PgPool};

#[derive(Deserialize, Serialize)]
pub struct CreateHistoryRequest {
    name: String,
    exercises: Json<Vec<Exercise>>,
    date: NaiveDate,
    // time: NaiveTime,
    duration: i32,
    points: i32,
}

#[post("/workouts/history")]
pub async fn create_history(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateHistoryRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    dbg!();
    let query = sqlx::query!(
        r#"
            INSERT INTO history (user_id, name, exercises, date, duration, points)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        user.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
        request.date,
        request.duration,
        request.points,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();
    dbg!();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct ReadHistoryResponse {
    history: Vec<History>,
}

#[get("/workouts/history")]
pub async fn read_history(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let history: Vec<History> = sqlx::query_as!(
        History,
        r#"
            SELECT id, name, exercises as "exercises: Json<Vec<Exercise>>", date, duration, points
            FROM history
            WHERE user_id = $1
            ORDER BY date DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadHistoryResponse { history: history }));
}

// //Grouped workout history
// #[get("/workouts/history")]
// pub async fn _history(user: AuthenticatedUser, pool: web::Data<PgPool>) -> Result<HttpResponse> {
//     // Fetch all workouts for this user
//     let records = sqlx::query_as!(
//         WorkoutRecord,
//         r#"
//         SELECT id, user_id, name, date, duration_minutes, points_earned
//         FROM workout_history
//         WHERE user_id = $1
//         ORDER BY date DESC
//         "#,
//         user.id
//     )
//     .fetch_all(pool.get_ref())
//     .await
//     .map_err(|e| ErrorBadRequest(format!("Database error: {}", e)))?;

//     // Group by month-year (e.g., "2025-10")
//     let mut grouped: BTreeMap<String, Vec<WorkoutSession>> = BTreeMap::new();

//     for rec in records {
//         let month_key = format!("{}-{:02}", rec.date.year(), rec.date.month());

//         let workout = WorkoutSession {
//             id: rec.id,
//             name: rec.name,
//             date: rec.date.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
//             workoutTime: rec.duration_minutes,
//             pointsEarned: rec.points_earned.unwrap_or(0),
//         };

//         grouped.entry(month_key).or_default().push(workout);
//     }

//     // Build final list of month groups
//     let mut result = Vec::new();

//     for (month_year, workouts) in grouped {
//         let total_sessions = workouts.len() as i64;
//         let total_gainz: i64 = workouts.iter().map(|w| w.pointsEarned as i64).sum();

//         // Parse month name for display
//         let (year, month_num) = match month_year.split_once('-') {
//             Some((y, m)) => (y.parse::<i32>().unwrap_or(0), m.parse::<u32>().unwrap_or(1)),
//             None => (0, 1),
//         };

//         let month_name = chrono::Month::try_from(month_num as u8)
//             .map(|m| format!("{:?}", m))
//             .unwrap_or_else(|_| "Unknown".to_string());

//         let display_month = format!("{} {}", month_name, year);

//         result.push(MonthGroup {
//             monthYear: month_year.clone(),
//             displayMonth: display_month,
//             totalSessions: total_sessions,
//             totalGainz: total_gainz,
//             workouts,
//         });
//     }

//     // Sort newest months first
//     result.sort_by(|a, b| b.monthYear.cmp(&a.monthYear));

//     Ok(HttpResponse::Ok().json(result))
// }

// //Get workout detail by ID

// #[get("/workouts/history/{id}")]
// pub async fn by_id(
//     user: AuthenticatedUser,
//     pool: web::Data<PgPool>,
//     path: web::Path<String>,
// ) -> Result<HttpResponse> {
//     let workout_id = path.into_inner();

//     let rec = sqlx::query_as!(
//         WorkoutRecord,
//         r#"
//         SELECT id, user_id, name, date, duration_minutes, points_earned
//         FROM workout_history
//         WHERE id = $1 AND user_id = $2
//         "#,
//         workout_id,
//         user.id
//     )
//     .fetch_optional(pool.get_ref())
//     .await
//     .map_err(|e| ErrorNotFound(format!("Database error: {}", e)))?;

//     // Handle not found
//     let rec = match rec {
//         Some(r) => r,
//         None => return Err(ErrorNotFound("Workout not found")),
//     };

//     // Formater
//     let workout = WorkoutSession {
//         id: rec.id,
//         name: rec.name,
//         date: chrono::DateTime::<Utc>::from_naive_utc_and_offset(rec.date, Utc).to_rfc3339(),
//         workoutTime: rec.duration_minutes,
//         pointsEarned: rec.points_earned.unwrap_or(0),
//     };

//     Ok(HttpResponse::Ok().json(workout))
// }

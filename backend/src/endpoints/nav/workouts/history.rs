use crate::jwt::AuthenticatedUser;
use actix_web::{get, web, HttpResponse, Result, error::ErrorNotFound , error::ErrorBadRequest};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use chrono::{Datelike, NaiveDateTime, Utc,};
use std::collections::BTreeMap;

// Database model 
#[derive(Serialize, Deserialize, FromRow)]
struct WorkoutRecord {
    id: String,
    user_id: i32,              
    name: String,
    date: NaiveDateTime,           
    duration_minutes: i32,
    points_earned: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkoutSession {
    pub id: String,
    pub name: String,
    pub date: String,          
    pub workoutTime: i32,
    pub pointsEarned: i32,
}

#[derive(Serialize, Deserialize)]
pub struct MonthGroup {
    pub monthYear: String,     // "2025-10"
    pub displayMonth: String,  // "October 2025"
    pub totalSessions: i64,
    pub totalGainz: i64,
    pub workouts: Vec<WorkoutSession>,
}

// Grouped workout history
// #[get("/history")]
// pub async fn get_workout_history(
//     user: AuthenticatedUser,
//     pool: web::Data<PgPool>,
// ) -> Result<HttpResponse> {
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
//             Some((y, m)) => (
//                 y.parse::<i32>().unwrap_or(0),
//                 m.parse::<u32>().unwrap_or(1),
//             ),
//             None => (0, 1),
//         };

//          let month_name = chrono::Month::try_from(month_num)
//              .map(|m| format!("{:?}", m))
//              .unwrap_or_else(|_| "Unknown".to_string());

//          let display_month = format!("{} {}", month_name, year);

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


// Get workout detail by ID
// #[get("/workout/{id}")]
// pub async fn get_workout_by_id(
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
//         date: chrono::DateTime::<Utc>::from_naive_utc_and_offset(rec.date, Utc)
//             .to_rfc3339(),
//         workoutTime: rec.duration_minutes,
//         pointsEarned: rec.points_earned.unwrap_or(0),
//     };

//     Ok(HttpResponse::Ok().json(workout))
// }
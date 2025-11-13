use super::workouts::history::CreateHistoryRequest;
use crate::jwt::AuthenticatedUser;
use crate::level::add_exp;
use crate::schemas::*;
use actix_web::post;
use actix_web::{HttpResponse, Result, error::ErrorBadRequest, error::ErrorNotFound, get, web};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use sqlx::types::chrono::NaiveDateTime;

pub async fn _read_quests(user: &AuthenticatedUser, pool: &web::Data<PgPool>) -> Vec<QuestRow> {
    let query: Vec<QuestRow> = sqlx::query_as!(
        QuestRow,
        r#"
            SELECT id, user_id, name,
                dificulty as "dificulty: QuestDificulty",
                status as "status: QuestStatus",
                number_of_workouts_needed, 
                number_of_workouts_completed, 
                workout_duration,
                exercise_category as "exercise_category: ExerciseCategory",
                exercise_muscle as "exercise_muscle: ExerciseMuscle"
            FROM quests
            WHERE user_id = $1
        "#,
        user.id,
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return query;
}

#[derive(Serialize, Deserialize)]
pub struct ReadQuestsResponse {
    pub quests: Vec<QuestRow>,
}

#[get("/quests")]
pub async fn read_quests(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let quests = _read_quests(&user, &pool).await;
    return Ok(HttpResponse::Ok().json(ReadQuestsResponse { quests: quests }));
}

pub async fn apply_workout_to_quests(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    workout: &CreateHistoryRequest,
) {
    let quests = _read_quests(&user, &pool).await;
    for quest in quests
        .iter()
        .filter(|quest| quest.status != QuestStatus::Complete)
    {
        if workout_applies_to_quest(&pool, &quest, workout).await {
            let number_of_workouts_completed = quest.number_of_workouts_completed + 1;

            if number_of_workouts_completed == quest.number_of_workouts_needed {
                // Quest has been completed
                let _ = sqlx::query!(
                    r#"
                        UPDATE quests
                        SET number_of_workouts_completed = $2, status = $3
                        WHERE id = $1
                    "#,
                    quest.id,
                    number_of_workouts_completed,
                    QuestStatus::Complete as QuestStatus
                )
                .execute(pool.get_ref())
                .await
                .unwrap();

                let exp = quest.dificulty.clone() as i32;

                add_exp(&user, &pool, exp).await.unwrap();
            }
        }
    }
}

pub async fn workout_applies_to_quest(
    pool: &web::Data<PgPool>,
    quest: &QuestRow,
    workout: &CreateHistoryRequest,
) -> bool {
    let mut flag = true;
    if let Some(workout_duration) = quest.workout_duration {
        flag &= workout.duration >= workout_duration;
    }
    if let Some(exercise_category) = &quest.exercise_category {
        let ids: Vec<String> = workout
            .exercises
            .0
            .iter()
            .map(|exercise| exercise.id.clone())
            .collect();

        let categories: Vec<ExerciseCategory> = sqlx::query_scalar!(
            r#"
                SELECT category as "category: ExerciseCategory"
                FROM exercises
                WHERE id = ANY($1)
            "#,
            &ids
        )
        .fetch_all(pool.get_ref())
        .await
        .unwrap();

        flag &= categories.contains(exercise_category);
    }
    if let Some(exercise_muscle) = &quest.exercise_muscle {}
    return flag;
}

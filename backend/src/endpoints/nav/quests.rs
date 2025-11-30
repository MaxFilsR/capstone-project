use {
    super::workouts::history::CreateHistoryRequest,
    crate::utils::{
        coins::add_coins,
        jwt::AuthenticatedUser,
        level::add_exp,
        schemas::{
            ExerciseCategory,
            ExerciseMuscle,
            QuestDifficulty,
            QuestRow,
            QuestStatus,
        },
    },
    actix_web::{
        self,
        HttpResponse,
        Result,
        get,
        post,
        web,
    },
    rand::{
        distr::{
            Alphanumeric,
            SampleString,
        },
        seq::{
            IndexedRandom,
            SliceRandom,
        },
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::PgPool,
    strum::VariantArray,
};

pub async fn _read_quests(user: &AuthenticatedUser, pool: &web::Data<PgPool>) -> Vec<QuestRow> {
    let query: Vec<QuestRow> = sqlx::query_as!(
        QuestRow,
        r#"
            SELECT id, user_id, name,
                difficulty as "difficulty: QuestDifficulty",
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

#[derive(Deserialize, Serialize)]
pub struct ReadQuestsResponse {
    pub quests: Vec<QuestRow>,
}

#[get("/quests")]
pub async fn read_quests(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let quests = _read_quests(&user, &pool).await;
    return Ok(HttpResponse::Ok().json(ReadQuestsResponse { quests }));
}

#[derive(Deserialize, Serialize)]
pub struct CreateQuestRequest {
    pub difficulty: QuestDifficulty,
}

#[derive(Deserialize, Serialize)]
pub struct CreateQuestResponse {
    pub name: String,
    pub difficulty: QuestDifficulty,
    pub status: QuestStatus,
    pub number_of_workouts_needed: i32,
    pub number_of_workouts_completed: i32,
    // possible requirements
    pub workout_duration: Option<i32>,
    pub exercise_category: Option<ExerciseCategory>,
    pub exercise_muscle: Option<ExerciseMuscle>,
}

#[post("/quests")]
pub async fn create_quest(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateQuestRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let mut rng = rand::rng();
    let mut fields = vec!["workout_duration", "exercise_category", "exercise_muscle"];
    fields.shuffle(&mut rng);

    let mut workout_duration: Option<i32> = None;
    let mut exercise_category: Option<ExerciseCategory> = None;
    let mut exercise_muscle: Option<ExerciseMuscle> = None;

    for field in fields.into_iter().take(request.difficulty.requirements()) {
        match field {
            "workout_duration" => workout_duration = Some(request.difficulty.workout_duration()),
            "exercise_category" => {
                exercise_category = Some(*ExerciseCategory::VARIANTS.choose(&mut rng).unwrap())
            }
            "exercise_muscle" => {
                exercise_muscle = Some(*ExerciseMuscle::VARIANTS.choose(&mut rng).unwrap())
            }
            _ => unreachable!(),
        }
    }

    let response = CreateQuestResponse {
        name: Alphanumeric.sample_string(&mut rng, 16),
        difficulty: request.difficulty,
        status: QuestStatus::Incomplete,
        number_of_workouts_needed: request.difficulty.number_of_workouts_needed(),
        number_of_workouts_completed: 0,
        workout_duration,
        exercise_category,
        exercise_muscle,
    };

    let _query = sqlx::query!(
        r#"
            INSERT INTO quests (user_id, name, difficulty, status, number_of_workouts_needed, number_of_workouts_completed, workout_duration, exercise_category, exercise_muscle)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        "#,
        user.id,
        response.name,
        response.difficulty as QuestDifficulty,
        response.status as QuestStatus,
        response.number_of_workouts_needed,
        response.number_of_workouts_completed,
        response.workout_duration,
        response.exercise_category as Option<ExerciseCategory>,
        response.exercise_muscle as Option<ExerciseMuscle>,
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(response));
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
        if workout_applies_to_quest(&pool, quest, workout).await {
            let number_of_workouts_completed = quest.number_of_workouts_completed + 1;

            if number_of_workouts_completed == quest.number_of_workouts_needed {
                // Quest has been completed
                let _query = sqlx::query!(
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

                add_exp(&user, &pool, quest.difficulty.exp()).await.unwrap();
                add_coins(&user, &pool, quest.difficulty.coins())
                    .await
                    .unwrap();
            } else {
                // Quest is still incomplete
                let _query = sqlx::query!(
                    r#"
                        UPDATE quests
                        SET number_of_workouts_completed = $2
                        WHERE id = $1
                    "#,
                    quest.id,
                    number_of_workouts_completed,
                )
                .execute(pool.get_ref())
                .await
                .unwrap();
            }
        }
    }
}

async fn workout_applies_to_quest(
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
    if let Some(exercise_muscle) = &quest.exercise_muscle {
        let ids: Vec<String> = workout
            .exercises
            .0
            .iter()
            .map(|exercise| exercise.id.clone())
            .collect();

        let query = sqlx::query!(
            r#"
                SELECT primary_muscles as "primary_muscles: Vec<ExerciseMuscle>", secondary_muscles as "secondary_muscles: Vec<ExerciseMuscle>"
                FROM exercises
                WHERE id = ANY($1)
            "#,
            &ids
        )
        .fetch_all(pool.get_ref())
        .await
        .unwrap();

        flag &= query
            .iter()
            .flat_map(|record| &record.primary_muscles)
            .chain(query.iter().flat_map(|record| &record.secondary_muscles))
            .collect::<Vec<&ExerciseMuscle>>()
            .contains(&exercise_muscle);
    }
    return flag;
}

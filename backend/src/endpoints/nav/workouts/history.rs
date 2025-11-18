use {
    crate::{
        endpoints::nav::quests::apply_workout_to_quests,
        jwt::AuthenticatedUser,
        level::add_exp,
        coins::add_coins,
        schemas::{
            Exercise,
            History,
        },
    },
    actix_web::{
        HttpResponse,
        Result,
        get,
        post,
        web,
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::{
        PgPool,
        types::{
            Json,
            chrono::NaiveDate,
        },
    },
};

#[derive(Deserialize, Serialize)]
pub struct CreateHistoryRequest {
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
    pub date: NaiveDate,
    // pub time: NaiveTime,
    pub duration: i32,
    pub points: i32, // exp
    pub coins: i32,
}

#[post("/workouts/history")]
pub async fn create_history(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateHistoryRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            INSERT INTO history (user_id, name, exercises, date, duration, points, coins)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        user.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
        request.date,
        request.duration,
        request.points,
        request.coins,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    add_exp(&user, &pool, request.points).await.unwrap();
    add_coins(&user, &pool, request.coins).await.unwrap();
    apply_workout_to_quests(user, pool, &request.0).await;

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
            SELECT id, name, exercises as "exercises: Json<Vec<Exercise>>", date, duration, points, coins
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

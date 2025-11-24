use {
    crate::{
        utils::jwt::AuthenticatedUser,
        utils::schemas::{Exercise, Routine},
    },
    actix_web::{HttpResponse, Result, delete, get, post, put, web},
    serde::{Deserialize, Serialize},
    sqlx::{PgPool, types::Json},
};

#[derive(Deserialize, Serialize)]
pub struct CreateRoutinesRequest {
    name: String,
    exercises: Json<Vec<Exercise>>,
}

#[post("/workout/routines")]
async fn create_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<CreateRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query_as!(
        Routine,
        r#"
            INSERT INTO routines (user_id, name, exercises)
            VALUES ($1, $2, $3)
        "#,
        user.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct ReadRoutinesResponse {
    routines: Vec<Routine>,
}

#[get("/workout/routines")]
async fn read_routines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, actix_web::Error> {
    let routines: Vec<Routine> = sqlx::query_as!(
        Routine,
        r#"
            SELECT id, name, exercises as "exercises: Json<Vec<Exercise>>"
            FROM routines
            where user_id = $1
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ReadRoutinesResponse { routines }));
}

#[derive(Deserialize, Serialize)]
pub struct UpdateRoutinesRequest {
    id: i32,
    name: String,
    exercises: Json<Vec<Exercise>>,
}

#[put("/workout/routines")]
async fn update_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<UpdateRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            UPDATE routines
            SET name = $3, exercises = $4
            WHERE user_id = $1 AND id = $2
        "#,
        user.id,
        request.id,
        request.name,
        serde_json::to_value(&request.exercises.0).unwrap(),
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

#[derive(Deserialize, Serialize)]
pub struct DeleteRoutinesRequest {
    id: i32,
}

#[delete("/workout/routines")]
async fn delete_rotuines(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    request: web::Json<DeleteRoutinesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            DELETE FROM routines
            WHERE user_id = $1 AND id = $2
        "#,
        user.id,
        request.id,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().finish());
}

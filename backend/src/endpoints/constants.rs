use crate::schemas::*;
use actix_web::{
    HttpResponse, post,
    web::{self},
};
use serde::Serialize;
use sqlx::PgPool;

#[derive(Serialize)]
struct ClassesResponse {
    pub classes: Vec<ClassRow>,
}

#[post("/constants/classes")]
async fn classes(pool: web::Data<PgPool>) -> Result<HttpResponse, actix_web::Error> {
    let classes: Vec<ClassRow> = sqlx::query_as!(
        ClassRow,
        r#"
            SELECT id, name, stats as "stats: Stats"
            FROM classes
            ORDER BY id
        "#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ClassesResponse { classes: classes }));
}


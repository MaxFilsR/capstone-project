use {
    crate::utils::schemas::*,
    actix_web::{
        HttpResponse,
        post,
        web::{
            self,
        },
    },
    serde::Serialize,
    sqlx::PgPool,
};

#[derive(Serialize)]
struct ClassesResponse {
    pub classes: Vec<ClassesRow>,
}

#[post("/constants/classes")]
async fn classes(pool: web::Data<PgPool>) -> Result<HttpResponse, actix_web::Error> {
    let classes: Vec<ClassesRow> = sqlx::query_as!(
        ClassesRow,
        r#"
            SELECT id, name, stats as "stats: Stats"
            FROM classes
            ORDER BY id
        "#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().json(ClassesResponse { classes }));
}

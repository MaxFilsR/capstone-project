use {
    actix_web::{
        HttpResponse,
        error::ErrorBadRequest,
        get,
        web,
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::PgPool,
    std::collections::HashMap,
};

#[derive(Deserialize, Serialize)]
pub struct ItemsRequest {
    ids: Vec<i32>,
}

#[derive(Deserialize, Serialize)]
pub struct ItemsResponse {
    items: HashMap<i32, Vec<u8>>,
}

#[get("/items")]
pub async fn item(
    pool: web::Data<PgPool>,
    request: web::Json<ItemsRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            SELECT id, path
            FROM items
            WHERE id = ANY($1) 
        "#,
        &request.ids
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap();

    let items: HashMap<i32, Vec<u8>> = HashMap::from_iter(query.into_iter().map(|row| {
        (
            row.id,
            std::fs::read(&row.path).unwrap_or_else(|_| {
                panic!(
                    "Failed to read asset with id = {} and path = {}",
                    row.id, &row.path
                )
            }),
        )
    }));

    return Ok(HttpResponse::Ok().json(ItemsResponse { items: items }));
}

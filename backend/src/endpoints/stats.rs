use {
    crate::utils::{
        jwt::AuthenticatedUser,
        schemas::Class,
    },
    actix_web::{
        HttpResponse,
        post,
        web,
    },
    serde::Deserialize,
    sqlx::PgPool,
};

#[derive(Deserialize)]
pub struct IncreaseStatRequest {
    pub stat: String, // "strength", "endurance", or "flexibility"
    pub amount: i32,
}

#[post("/stats/increase")]
pub async fn increase_stat(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<IncreaseStatRequest>,
) -> HttpResponse {
    // Get current stats and pending points
    let query = sqlx::query!(
        r#"
        SELECT class as "class: Class", pending_stat_points
        FROM characters
        WHERE user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    if req.amount > query.pending_stat_points {
        return HttpResponse::BadRequest().body("Not enough pending stat points");
    }

    let mut class = query.class;

    match req.stat.as_str() {
        "strength" => class.stats.strength += req.amount,
        "endurance" => class.stats.endurance += req.amount,
        "flexibility" => class.stats.flexibility += req.amount,
        _ => return HttpResponse::BadRequest().body("Invalid stat name"),
    }

    let new_pending = query.pending_stat_points - req.amount;

    // Update table
    let _query = sqlx::query!(
        r#"
        UPDATE characters
        SET class = $2, pending_stat_points = $3
        WHERE user_id = $1
        "#,
        user.id,
        class as Class,
        new_pending
    )
    .execute(pool.get_ref())
    .await;

    HttpResponse::Ok().body(format!(
        "Updated {} by {} point(s). Remaining points: {}",
        req.stat, req.amount, new_pending
    ))
}

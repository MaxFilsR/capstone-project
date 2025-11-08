use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, web, post};
use sqlx::PgPool;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct IncreaseStatRequest {
    pub stat: String,   // "strength", "endurance", or "flexibility"
    pub amount: i32,
}

#[post("/stats/increase")]
pub async fn increase_stat(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<IncreaseStatRequest>,
) -> HttpResponse {
    // Get current stats and pending points 
    let row = sqlx::query!(
        r#"
        SELECT (characters.class).stats.strength as "strength!",
               (characters.class).stats.endurance as "endurance!",
               (characters.class).stats.flexibility as "flexibility!",
               pending_stat_points as "pending_stat_points!"
        FROM characters
        WHERE user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    if req.amount > row.pending_stat_points {
        return HttpResponse::BadRequest().body("Not enough pending stat points");
    }
    let (new_strength, new_endurance, new_flexibility) = match req.stat.as_str() {
        "strength" => (row.strength + req.amount, row.endurance, row.flexibility),
        "endurance" => (row.strength, row.endurance + req.amount, row.flexibility),
        "flexibility" => (row.strength, row.endurance, row.flexibility + req.amount),
        _ => return HttpResponse::BadRequest().body("Invalid stat name"),
    };

    let new_pending = row.pending_stat_points - req.amount;
 
    // Update table
    let _ = sqlx::query!(
        r#"
        UPDATE characters
        SET class = ROW((characters.class).name, ROW($2, $3, $4)::stats)::class,
            pending_stat_points = $5
        WHERE user_id = $1
        "#,
        user.id,
        new_strength,
        new_endurance,
        new_flexibility,
        new_pending
    )
    .execute(pool.get_ref())
    .await;

    HttpResponse::Ok().body(format!(
        "Updated {} by {} point(s). Remaining points: {}",
        req.stat, req.amount, new_pending
    ))
}


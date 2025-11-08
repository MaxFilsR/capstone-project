use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, web};
use sqlx::PgPool;

pub fn exp_needed_for_level(n: i32) -> i32 {
    let exp_needed = (200.0 * (1.07 as f64).powi(n)).floor() as i32;
    return exp_needed;
}

pub async fn add_exp(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    exp: i32,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            SELECT level, exp_leftover, pending_stat_points
            FROM characters
            WHERE user_id = $1
        "#,
        user.id,
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    let mut current_level = query.level;    // current level
    let mut total_exp = query.exp_leftover + exp;   // leftover + workout exp
    let mut levels_gained = 0;  // counter

    // Handle multiple level-ups
    loop {
        let exp_needed = exp_needed_for_level(current_level);
        if total_exp >= exp_needed {
            total_exp -= exp_needed;
            current_level += 1;
            levels_gained += 1;
        } else {
            break;
        }
    }

    let new_pending_points = query.pending_stat_points + levels_gained;

    let _query = sqlx::query!(
        r#"
            UPDATE characters
            SET level = $2, exp_leftover = $3, pending_stat_points = $4
            WHERE user_id = $1
        "#,
        user.id,
        current_level,
        total_exp,
        new_pending_points,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}


/*

use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, web};
use sqlx::PgPool;

pub fn exp_needed_for_level(n: i32) -> i32 {
    let exp_needed = (200.0 * (1.07 as f64).powi(n)).floor() as i32;
    return exp_needed;
}

pub async fn add_exp(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    exp: i32,
) -> Result<HttpResponse, actix_web::Error> {
    let query = sqlx::query!(
        r#"
            SELECT level, exp_leftover
            FROM characters
            WHERE user_id = $1
        "#,
        user.id,
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();

    let exp_needed = exp_needed_for_level(query.level);
    let level = (query.exp_leftover + exp) / exp_needed;
    let exp_leftover = (query.exp_leftover + exp) % exp_needed;

    let _query = sqlx::query!(
        r#"
            UPDATE characters
            SET level = $2, exp_leftover = $3 
            WHERE user_id = $1
        "#,
        user.id,
        level,
        exp_leftover,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}

*/
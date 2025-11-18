use {
    crate::jwt::AuthenticatedUser,
    actix_web::{
        HttpResponse,
        web,
    },
    sqlx::PgPool,
};

pub async fn add_coins(
    user: &AuthenticatedUser,
    pool: &web::Data<PgPool>,
    coins: i32,
) -> Result<HttpResponse, actix_web::Error> {
    let _query = sqlx::query!(
        r#"
            UPDATE characters
            SET coins = coins + $2
            WHERE user_id = $1
        "#,
        user.id,
        coins,
    )
    .execute(pool.get_ref())
    .await
    .unwrap();

    return Ok(HttpResponse::Ok().into());
}
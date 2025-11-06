use crate::jwt::AuthenticatedUser;
use actix_web::{HttpResponse, web};
use sqlx::PgPool;

pub async fn add_stats(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    strength: i32,
    endurance: i32,
    flexibility: i32,
) -> Result<HttpResponse, actix_web::Error> {
    let row = sqlx::query!(
        r#"
            SELECT (class).name as "class_name!",
                   ((class).stats).strength as "strength!",
                   ((class).stats).endurance as "endurance!",
                   ((class).stats).flexibility as "flexibility!"
            FROM characters
            WHERE user_id = $1
        "#,
        user.id,
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap();
   
    sqlx::query!(
        r#"
            UPDATE characters
            SET class = ROW($2, ROW($3, $4, $5)::stats)::class
            WHERE user_id = $1
        "#,
        user.id,
        row.class_name,  
        row.strength + strength,          
        row.endurance + endurance,        
        row.flexibility + flexibility,    
    )
    .execute(pool.get_ref())
    .await
    .unwrap();
   
    return Ok(HttpResponse::Ok().into());
}

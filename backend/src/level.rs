use sqlx::PgPool;

pub fn exp_needed_for_level(n: i32) -> i32 {
    let exp_needed = (200.0 * (1.07 as f64).powi(n)).floor() as i32;
    return exp_needed;
}

pub fn add_exp(pool: PgPool, exp: i32) {
    let _ = (pool, exp);
    todo!();
}

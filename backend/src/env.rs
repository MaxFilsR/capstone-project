use std::env;

pub const ACTIX_WEB_ADDRESS: &str = "ACTIX_WEB_ADDRESS";
pub const ACTIX_WEB_PORT: &str = "ACTIX_WEB_PORT";
pub const DATABASE_URL: &str = "DATABASE_URL";
pub const JWT_SECRET_KEY: &str = "JWT_SECRET_KEY";

pub fn get_env_var_with_key(key: &str) -> String {
    let val = env::var(key).expect(&format!("{key} must be set"));
    println!("env variable {key} = {val}");
    return val;
}

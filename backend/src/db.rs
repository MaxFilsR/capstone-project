use sqlx::sqlite::{SqliteConnectOptions, /*SqlitePoolOptions*/};
use sqlx::{ConnectOptions, SqliteConnection};
use std::str::FromStr;


pub async fn init() -> SqliteConnection{
  let db_option = SqliteConnectOptions::from_str("sqlite://users.db").unwrap().create_if_missing(true); //Create a db if non existent
  
  return db_option.connect().await.unwrap();
}
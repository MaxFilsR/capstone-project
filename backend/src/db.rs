/*
  This file is responsible to serve as an interface for the backend to the database.
*/

//libs
use dotenvy;
use sqlx::ConnectOptions;
use sqlx::postgres::{PgConnectOptions, PgConnection};

//const DATABASE_URL: &str= "http://localhost:5432";

pub async fn connect() -> PgConnection {
    dotenvy::from_filename_override("./db/.env").unwrap();
    // Connection parameters loaded in from `./db/.env` file.
    // https://docs.rs/sqlx/latest/sqlx/postgres/struct.PgConnectOptions.html#parameters
    let connection = PgConnectOptions::new().connect().await.unwrap();
    return connection;
}

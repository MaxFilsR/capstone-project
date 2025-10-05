/*
  This file is responsible to serve as an interface for the backend to the database.
*/

//libs
use sqlx::Connection;
use sqlx::postgres::PgConnection;

const DATABASE_URL: &str = "postgres://localhost:5432";

pub async fn connect() -> PgConnection {
    let connection = PgConnection::connect(DATABASE_URL).await.unwrap();
    return connection;
}

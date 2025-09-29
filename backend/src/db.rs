/*
  This file is responsible to serve as an interface for the backend to the database. 
*/

//libs
use sqlx::{Connection, ConnectOptions};
use sqlx::postgres::{PgConnection, PgConnectOptions};
//const DATABASE_URL: &str= "http://localhost:5432";

pub async fn get_connection(){
  let con = PgConnectionOptions::new()
  .host("localhost")
  .port(5432)
  .username()
  .await?;
}




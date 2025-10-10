use serde::{Deserialize, Serialize};

#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "stats")]
pub struct Stats {
    pub vitality: i32,
    pub strength: i32,
    pub endurance: i32,
    pub agility: i32,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct ClassRow {
    pub id: i32,
    pub name: String,
    pub stats: Stats,
}

#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "class")]
pub struct Class {
    pub name: String,
    pub stats: Stats,
}

#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct UserRow {
    pub id: i32,
    pub email: String,
    pub password: String,
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub class: Class,
    pub workout_schedule: [bool; 7],
}

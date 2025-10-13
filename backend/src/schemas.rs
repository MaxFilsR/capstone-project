use serde::{Deserialize, Serialize};

// Defined stats for a character
#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "stats")]
pub struct Stats {
    pub strength: i32,
    pub endurance: i32,
    pub flexability: i32,
}

// Fetchimg class info from the database
// Each class (ex: Warrior, Monk, Assassin) has its own ID, name, and base `Stats`.
// This struct is used for queries like: `SELECT id, name, stats from classes.
#[derive(Debug, sqlx::FromRow, Serialize)]
pub struct ClassRow {
    pub id: i32,
    pub name: String,
    pub stats: Stats,
}

// Represents the class composite type in PostgreSQL.
// This is stored directly in the `user_info` table to represent a user's chosen class.
#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "class")]
pub struct Class {
    pub name: String,
    pub stats: Stats,
}

// Represents a complete user record including login credentials, personal info, chosen class, and workout schedule.
#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct UserInfoRow {
    pub user_id: i32,
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub class: Class,
    pub workout_schedule: Vec<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub class: Class,
    pub workout_schedule: Vec<bool>,
}

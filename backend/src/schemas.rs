use chrono::{
    NaiveDate, 
    // NaiveTime
};
use serde::{Deserialize, Serialize};
use sqlx::types::Json;

// Defined stats for a character
#[derive(sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(type_name = "stats")]
pub struct Stats {
    pub strength: i32,
    pub endurance: i32,
    pub flexibility: i32,
}

// Fetchimg class info from the database
// Each class (ex: Warrior, Monk, Assassin) has its own ID, name, and base `Stats`.
// This struct is used for queries like: `SELECT id, name, stats from classes.
#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct ClassesRow {
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
// #[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
// pub struct UserInfoRow {
//     pub user_id: i32,
//     pub first_name: String,
//     pub last_name: String,
//     pub username: String,
//     pub class: Class,
//     pub workout_schedule: Vec<bool>,
// }

#[derive(Deserialize, Serialize, sqlx::Type, Debug)]
pub struct Exercise {
    pub id: String,
    pub sets: i32,
    pub reps: i32,
    pub weight: f32,
    pub distance: f32,
}

#[derive(Debug, sqlx::FromRow, Serialize, Deserialize)]
pub struct RoutinesRow {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Deserialize, Serialize, sqlx::FromRow)]
pub struct Routine {
    pub id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct HistoryRow {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
    pub date: NaiveDate,
    // pub time: NaiveTime,
    pub duration: i32,
    pub points: i32,
}

struct HistoryRoutine {
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Serialize, Deserialize)]
pub struct History {
    pub id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
    pub date: NaiveDate,
    // pub time: NaiveTime,
    pub duration: i32,
    pub points: i32,
}

#[derive(Serialize, Deserialize, sqlx::Type, Debug)]
pub struct Equipped {
    pub arms: i32,
    pub background: i32,
    pub bodies: i32,
    pub head: i32,
    pub head_accessory: i32,
    pub pet: i32,
    pub weapon: i32,
}

#[derive(Serialize, Deserialize, sqlx::Type, Debug)]
pub struct Inventory {
    pub arms: Vec<i32>,
    pub backgrounds: Vec<i32>,
    pub bodiess: Vec<i32>,
    pub heads: Vec<i32>,
    pub head_accessories: Vec<i32>,
    pub pets: Vec<i32>,
    pub weapons: Vec<i32>,
}


#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct CharactersRow {
    pub user_id: i32,
    pub username: String,
    pub class: Class,
    pub level: i32,
    pub exp_leftover: i32,
    pub streak: i32,
    pub equipped: Equipped,
    pub inventory: Inventory,
}

#[derive(Serialize, Deserialize)]
pub struct Character {
    pub username: String,
    pub class: Class,
    pub level: i32,
    pub exp_leftover: i32,
    pub streak: i32,
    pub equipped: Equipped,
    pub inventory: Inventory,
}


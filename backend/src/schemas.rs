use {
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::types::{
        Json,
        chrono::NaiveDate,
    },
};

// Defined stats for a character
#[derive(Clone, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name = "stats")]
pub struct Stats {
    pub strength: i32,
    pub endurance: i32,
    pub flexibility: i32,
}

// Fetchimg class info from the database
// Each class (ex: Warrior, Monk, Assassin) has its own ID, name, and base `Stats`.
// This struct is used for queries like: `SELECT id, name, stats from classes.
#[derive(Clone, Debug, Deserialize, sqlx::FromRow, Serialize)]
pub struct ClassesRow {
    pub id: i32,
    pub name: String,
    pub stats: Stats,
}

// Represents the class composite type in PostgreSQL.
// This is stored directly in the `user_info` table to represent a user's chosen class.
#[derive(Clone, Debug, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name = "class")]
pub struct Class {
    pub name: String,
    pub stats: Stats,
}

// Represents a complete user record including login credentials, personal info, chosen class, and workout schedule.
// #[derive(Debug, Deserialize, sqlx::FromRow, Serialize)]
// pub struct UserInfoRow {
//     pub user_id: i32,
//     pub first_name: String,
//     pub last_name: String,
//     pub username: String,
//     pub class: Class,
//     pub workout_schedule: Vec<bool>,
// }

#[derive(Clone, Debug, Deserialize, Serialize, sqlx::Type)]
pub struct Exercise {
    pub id: String,
    pub sets: i32,
    pub reps: i32,
    pub weight: f32,
    pub distance: f32,
}

#[derive(Clone, Debug, Deserialize, sqlx::FromRow, Serialize)]
pub struct RoutinesRow {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Clone, Deserialize, sqlx::FromRow, Serialize)]
pub struct Routine {
    pub id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Clone, Deserialize, sqlx::FromRow, Serialize)]
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

#[derive(Clone, Deserialize, Serialize)]
struct HistoryRoutine {
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct History {
    pub id: i32,
    pub name: String,
    pub exercises: Json<Vec<Exercise>>,
    pub date: NaiveDate,
    // pub time: NaiveTime,
    pub duration: i32,
    pub points: i32,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name = "equipped")]
pub struct Equipped {
    pub arms: i32,
    pub background: i32,
    pub bodies: i32,
    pub head: i32,
    pub head_accessory: i32,
    pub pet: i32,
    pub weapon: i32,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, sqlx::Type)]
#[sqlx(type_name = "inventory")]
pub struct Inventory {
    pub arms: Vec<i32>,
    pub backgrounds: Vec<i32>,
    pub bodies: Vec<i32>,
    pub heads: Vec<i32>,
    pub head_accessories: Vec<i32>,
    pub pets: Vec<i32>,
    pub weapons: Vec<i32>,
}

#[derive(Clone, Deserialize, sqlx::FromRow, Serialize)]
pub struct CharactersRow {
    pub user_id: i32,
    pub username: String,
    pub class: Class,
    pub level: i32,
    pub exp_leftover: i32,
    pub pending_stat_points: i32,
    pub streak: i32,
    pub equipped: Equipped,
    pub inventory: Inventory,
    pub friends: Vec<i32>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct Character {
    pub username: String,
    pub class: Class,
    pub level: i32,
    pub exp_leftover: i32,
    pub pending_stat_points: i32,
    pub streak: i32,
    pub equipped: Equipped,
    pub inventory: Inventory,
    pub friends: Vec<i32>,
}

#[derive(Clone, Deserialize, sqlx::FromRow, Serialize)]
pub struct SettingsRow {
    pub user_id: i32,
    pub first_name: String,
    pub last_name: String,
    pub workout_schedule: Vec<bool>,
}

#[derive(Clone, Debug, Deserialize, Serialize, sqlx::Type)]
pub struct Settings {
    pub first_name: String,
    pub last_name: String,
    pub workout_schedule: Vec<bool>,
}

#[derive(
    Clone, Copy, Debug, Deserialize, strum::VariantArray, PartialEq, Serialize, sqlx::Type,
)]
#[sqlx(type_name = "exercise_category", rename_all = "lowercase")]
#[allow(non_camel_case_types)]
pub enum ExerciseCategory {
    powerlifting,
    strength,
    stretching,
    cardio,
    olympic_weightlifting,
    strongman,
    plyometrics,
}

#[derive(
    Clone, Copy, Serialize, Deserialize, sqlx::Type, strum::VariantArray, Debug, PartialEq,
)]
#[sqlx(type_name = "exercise_muscle", rename_all = "lowercase")]
#[allow(non_camel_case_types)]
pub enum ExerciseMuscle {
    abdominals,
    abductors,
    adductors,
    biceps,
    calves,
    chest,
    forearms,
    glutes,
    hamstrings,
    lats,
    lower_back,
    middle_back,
    neck,
    quadriceps,
    shoulders,
    traps,
    tricep,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "quest_dificulty", rename_all = "lowercase")]
pub enum QuestDificulty {
    Easy,
    Medium,
    Hard,
}

impl QuestDificulty {
    pub fn exp(self) -> i32 {
        match self {
            QuestDificulty::Easy => 500,
            QuestDificulty::Medium => 2_500,
            QuestDificulty::Hard => 10_000,
        }
    }

    pub fn number_of_workouts_needed(self) -> i32 {
        match self {
            QuestDificulty::Easy => 1,
            QuestDificulty::Medium => rand::random_range(3..=5),
            QuestDificulty::Hard => rand::random_range(10..=15),
        }
    }

    pub fn requierments(self) -> usize {
        match self {
            QuestDificulty::Easy => 1,
            QuestDificulty::Medium => 2,
            QuestDificulty::Hard => 3,
        }
    }

    pub fn workout_duration(self) -> i32 {
        match self {
            QuestDificulty::Easy => rand::random_range(1..=6) * 5,
            QuestDificulty::Medium => rand::random_range(9..=12) * 5,
            QuestDificulty::Hard => rand::random_range(16..=24) * 5,
        }
    }
}

#[derive(Clone, Copy, Serialize, Deserialize, sqlx::Type, Debug, PartialEq)]
#[sqlx(type_name = "quest_status", rename_all = "lowercase")]
pub enum QuestStatus {
    Incomplete,
    Complete,
}

#[derive(Clone, Deserialize, sqlx::FromRow, Serialize)]
pub struct QuestRow {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub dificulty: QuestDificulty,
    pub status: QuestStatus,
    pub number_of_workouts_needed: i32, // Intervals of 1, Easy: 1, Medium: 3-5, Hard: 10-15
    pub number_of_workouts_completed: i32,
    // possible requierments
    pub workout_duration: Option<i32>, // Intervels of 5, Easy: 5-30, Medium: 45-60, Hard: 90-120
    pub exercise_category: Option<ExerciseCategory>,
    pub exercise_muscle: Option<ExerciseMuscle>,
}

use constcat::concat;

// Runtime
const ASSETS_PATH: &str = "/srv/assets/";
pub const ITEMS_PATH: &str = concat!(ASSETS_PATH, "items/");
pub const EXERCISES_PATH: &'static str = concat!(ASSETS_PATH, "exercises.json");

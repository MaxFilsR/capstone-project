pub mod endpoints {
    pub mod nav {
        pub mod character;
        pub mod quests;
        pub mod social;
        pub mod workouts {
            pub mod history;
            pub mod library;
            pub mod records;
            pub mod routines;
        }
    }
    pub mod auth;
    pub mod constants;
    pub mod onboarding;
}

pub mod env;
pub mod jwt;
pub mod level;
pub mod schemas;
pub mod stats;

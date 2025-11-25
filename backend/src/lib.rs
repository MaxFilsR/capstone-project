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
    pub mod constants {
        pub mod classes;
        pub mod items;
    }
    pub mod auth;
    pub mod onboarding;
    pub mod settings;
    pub mod stats;
}
pub mod utils {
    pub mod coins;
    pub mod env;
    pub mod jwt;
    pub mod level;
    pub mod schemas;
}

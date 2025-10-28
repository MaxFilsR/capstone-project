-- This file is responsible to properly initiate the database and all types required for the app to function
-- Stores users, exercises, items, class types

-- !Database gainzdb is initially created during postgres initialization, no need to create a new one

-- Enter database to initialize it
\c gainzdb;

-- -- Fix for Daniel
-- CREATE ROLE dyredhead
-- WITH
-- 	LOGIN;

-- CREATE ROLE root
-- WITH
-- 	LOGIN;

-- Gives functions for hashing and veryfying passwords within postgres
CREATE EXTENSION pgcrypto;

CREATE TYPE exercise AS (
	id INT,
	sets INT,
	reps INT,
	weight REAL,
	distance REAL
);

CREATE TYPE stats AS (
	strength INT,
	endurance INT,
	flexibility INT
);

CREATE TYPE class AS (
	name TEXT, 
	stats STATS
);

-- Defines item rarity
CREATE TYPE item_rarity AS ENUM (
    'common',
    'uncommon',
    'rare',
    'ultra rare',
    'mythical'
);

--
-- WORKOUT SPECIFIC TYPE DEFINITIONS
--

-- ? What?
CREATE TYPE exercise_force AS ENUM (
    'static',
    'pull',
    'push'
);

-- Defines exercise difficulty types
CREATE TYPE exercise_level AS ENUM (
    'beginner',
    'intermediate',
    'expert'
);

-- ?
CREATE TYPE exercise_mechanic AS ENUM (
    'isolation',
    'compound'
);

-- Defines exercise equipement for exercise filtering
CREATE TYPE exercise_equipment AS ENUM (
    'medicine ball',
    'dumbbell',
    'body only',
    'bands',
    'kettlebells',
    'foam roll',
    'cable',
    'machine',
    'barbell',
    'exercise ball',
    'e-z curl bar',
    'other'
);

-- Defines muscles for exercies filtering
CREATE TYPE exercise_muscle AS ENUM (
    'abdominals',
    'abductors',
    'adductors',
    'biceps',
    'calves',
    'chest',
    'forearms',
    'glutes',
    'hamstrings',
    'lats',
    'lower back',
    'middle back',
    'neck',
    'quadriceps',
    'shoulders',
    'traps',
    'triceps'
);

-- Defines exercise categories for filtering
CREATE TYPE exercise_category AS ENUM (
	'powerlifting',
    'strength',
    'stretching',
    'cardio',
    'olympic weightlifting',
    'strongman',
    'plyometrics'
);

--
-- TABLES
--

-- Table to store users(players)
CREATE TABLE IF NOT EXISTS
	users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		onboarding_complete BOOLEAN NOT NULL
	);

-- Table to store more detailed information about users
CREATE TABLE IF NOT EXISTS
	user_info (
		user_id INT REFERENCES users (id) PRIMARY KEY,
		first_name VARCHAR(255) NOT NULL,
		last_name VARCHAR(255) NOT NULL,
		username VARCHAR(255) NOT NULL,
		class CLASS NOT NULL,
		workout_schedule BOOLEAN[7] NOT NULL
	);

-- Table to store items
CREATE TABLE IF NOT EXISTS
	items (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		category VARCHAR(50) NOT NULL,
		rarity item_rarity NOT NULL,
		price INT NOT NULL,
		asset_url TEXT
	);

-- Table to store item related info of users
CREATE TABLE IF NOT EXISTS
	user_items (
		user_id INT NOT NULL REFERENCES users (id),
		item_id INT NOT NULL REFERENCES items (id),
		acquired_at TIMESTAMP DEFAULT NOW() NOT NULL,
		PRIMARY KEY (user_id, item_id)
	);

-- Table to store user equipped items
CREATE TABLE IF NOT EXISTS
	user_equipment (
		user_id INT PRIMARY KEY REFERENCES users (id),
		head INT REFERENCES items (id),
		head_accessory INT REFERENCES items (id),
		body INT REFERENCES items (id),
		arms INT REFERENCES items (id),
		weapon INT REFERENCES items (id),
		background INT REFERENCES items (id)
	);

-- ?
CREATE TABLE IF NOT EXISTS
	shop_rotations (
		id SERIAL PRIMARY KEY,
		item_id INT NOT NULL REFERENCES items (id),
		start_date TIMESTAMP,
		end_date TIMESTAMP
	);

-- Table storing classes, predefined later in this file
CREATE TABLE IF NOT EXISTS
	classes (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		stats STATS NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	exercises (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		force exercise_force,
		level exercise_level NOT NULL,
		mechanic exercise_mechanic,
		equipment exercise_equipment,
		primary_muscles exercise_muscle[] NOT NULL,
		secondary_muscles exercise_muscle[] NOT NULL,
		instructions TEXT[] NOT NULL,
		category exercise_category NOT NULL,
		images TEXT[] NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	routines (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL REFERENCES users (id),
		name TEXT NOT NULL,
		exercises JSONB NOT NULL
	);

-- History
CREATE TABLE IF NOT EXISTS 
	history (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id),
		name TEXT NOT NULL,
		exercises JSONB NOT NULL,
		date DATE NOT NULL,         			
		-- time TIME NOT NULL,         			
		duration INTEGER NOT NULL,  			
		points INTEGER NOT NULL
	);


-- Preseed actual data

INSERT INTO
	classes (id, name, stats)
VALUES
	(1, 'Warrior', ROW (10, 7, 5)),
	(2, 'Monk', ROW (4, 7, 10)),
	(3, 'Assassin', ROW (5, 10, 6)),
	(4, 'Wizard', ROW (7, 7, 7)),
	(5, 'Gladiator', ROW (6, 5, 5));


INSERT INTO 
	users (id, email, password, onboarding_complete)
VALUES
	(1, 'you@example.com', crypt('12345678', gen_salt('md5')), TRUE);

INSERT INTO
	user_info (user_id, first_name, last_name,username, class, workout_schedule)
VALUES
	(1, 'John', 'Doe', 'JDoe', ROW('Warrior', ROW(10, 7, 5)), '{TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE}');

-- Defining exercises
-- ToDo: Make sure it stores everything right
-- \set exercises_json `cat /docker-entrypoint-initdb.d/exercises.json`

-- INSERT INTO exercises 
-- SELECT 
-- 	data->>'id', 
-- 	data->>'name', 
-- 	(data->>'force')::exercise_force,
-- 	(data->>'level')::exercise_level,
-- 	(data->>'mechanic')::exercise_mechanic,
-- 	(data->>'equipment')::exercise_equipment,
-- 	ARRAY (
-- 		SELECT value::exercise_muscle
-- 		FROM jsonb_array_elements_text(data->'primaryMuscles') AS value
-- 	),
-- 	ARRAY (
-- 		SELECT value::exercise_muscle
-- 		FROM jsonb_array_elements_text(data->'secondaryMuscles') AS value
-- 	),
-- 	ARRAY (
-- 		SELECT value
-- 		FROM jsonb_array_elements_text(data->'instructions') AS value
-- 	),
-- 	(data->>'category')::exercise_category,
-- 	ARRAY (
-- 		SELECT value
-- 		FROM jsonb_array_elements_text(data->'images') AS value
-- 	)
-- FROM jsonb_array_elements(:'exercises_json'::jsonb) AS data;



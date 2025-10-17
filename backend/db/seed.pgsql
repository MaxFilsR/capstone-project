CREATE DATABASE gainzdb;

\c gainzdb;

CREATE ROLE dyredhead
WITH
	LOGIN;

CREATE EXTENSION pgcrypto;

CREATE TYPE stats AS (
	strength INT,
	endurance INT,
	flexibility INT
);

CREATE TYPE class AS (
	name TEXT, 
	stats STATS
);

CREATE TYPE item_rarity AS ENUM (
    'common',
    'uncommon',
    'rare',
    'ultra rare',
    'mythical'
);

CREATE TYPE exercise_force AS ENUM (
    'static',
    'pull',
    'push'
);

CREATE TYPE exercise_level AS ENUM (
    'beginner',
    'intermediate',
    'expert'
);

CREATE TYPE exercise_mechanic AS ENUM (
    'isolation',
    'compound'
);

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

CREATE TYPE exercise_category AS ENUM (
	'powerlifting',
    'strength',
    'stretching',
    'cardio',
    'olympic weightlifting',
    'strongman',
    'plyometrics'
);

-- Tables
CREATE TABLE IF NOT EXISTS
	users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		onboarding_complete BOOLEAN NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	user_info (
		user_id INT REFERENCES users (id) PRIMARY KEY,
		first_name VARCHAR(255) NOT NULL,
		last_name VARCHAR(255) NOT NULL,
		username VARCHAR(255) NOT NULL,
		class CLASS NOT NULL,
		workout_schedule BOOLEAN[7] NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	items (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		category VARCHAR(50) NOT NULL,
		rarity item_rarity NOT NULL,
		price INT NOT NULL,
		asset_url TEXT
	);

CREATE TABLE IF NOT EXISTS
	user_items (
		user_id INT NOT NULL REFERENCES users (id),
		item_id INT NOT NULL REFERENCES items (id),
		acquired_at TIMESTAMP DEFAULT NOW() NOT NULL,
		PRIMARY KEY (user_id, item_id)
	);

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

CREATE TABLE IF NOT EXISTS
	shop_rotations (
		id SERIAL PRIMARY KEY,
		item_id INT NOT NULL REFERENCES items (id),
		start_date TIMESTAMP,
		end_date TIMESTAMP
	);

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

-- Preseed actual data

INSERT INTO
	classes (id, name, stats)
VALUES
	(1, 'Warrior', ROW (10, 7, 5)),
	(2, 'Monk', ROW (4, 7, 10)),
	(3, 'Assassin', ROW (5, 10, 6)),
	(4, 'Wizard', ROW (7, 7, 7)),
	(5, 'Gladiator', ROW (6, 5, 5));


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


-- History
CREATE TABLE IF NOT EXISTS workout_history (
    id TEXT PRIMARY KEY,                			
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,                 			
    date TIMESTAMP NOT NULL,            			
    duration_minutes INTEGER NOT NULL,  			
    points_earned INTEGER DEFAULT 0,    			
    created_at TIMESTAMP DEFAULT NOW()
);

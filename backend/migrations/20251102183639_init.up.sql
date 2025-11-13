-- This file is responsible to properly initiate the database and all types required for the app to function
-- Stores users, exercises, items, class types
-- !Database gainzdb is initially created during postgres initialization, no need to create a new one
-- Enter database to initialize it
--\c gainzdb;
--
-- Gives functions for hashing and veryfying passwords within postgres
CREATE EXTENSION pgcrypto;

CREATE TYPE exercise AS (
	id INTEGER,
	sets INTEGER,
	reps INTEGER,
	weight REAL,
	distance REAL
);

CREATE TYPE stats AS (
	strength INTEGER,
	endurance INTEGER,
	flexibility INTEGER
);

CREATE TYPE class AS (name TEXT, stats STATS);

CREATE TYPE equipped AS (
	arms INTEGER,
	background INTEGER,
	bodies INTEGER,
	head INTEGER,
	head_accessory INTEGER,
	pet INTEGER,
	weapon INTEGER
);

CREATE TYPE inventory AS (
	arms INTEGER[],
	backgrounds INTEGER[],
	bodies INTEGER[],
	heads INTEGER[],
	head_accessories INTEGER[],
	pets INTEGER[],
	weapons INTEGER[]
);

-- Defines item rarity
CREATE TYPE item_rarity AS ENUM(
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
CREATE TYPE exercise_force AS ENUM('static', 'pull', 'push');

-- Defines exercise difficulty types
CREATE TYPE exercise_level AS ENUM('beginner', 'intermediate', 'expert');

-- ?
CREATE TYPE exercise_mechanic AS ENUM('isolation', 'compound');

-- Defines exercise equipement for exercise filtering
CREATE TYPE exercise_equipment AS ENUM(
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
CREATE TYPE exercise_muscle AS ENUM(
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
CREATE TYPE exercise_category AS ENUM(
	'powerlifting',
	'strength',
	'stretching',
	'cardio',
	'olympic weightlifting',
	'strongman',
	'plyometrics'
);

CREATE TYPE quest_dificulty AS ENUM('easy', 'medium', 'hard');

CREATE TYPE quest_status AS ENUM('incomplete', 'complete');

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
	settings (
		user_id INTEGER PRIMARY KEY REFERENCES users (id),
		first_name VARCHAR(255) NOT NULL,
		last_name VARCHAR(255) NOT NULL,
		workout_schedule BOOLEAN[7] NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	characters (
		user_id INTEGER PRIMARY KEY REFERENCES users (id),
		username VARCHAR(255) NOT NULL,
		class Class NOT NULL,
		level INT NOT NULL,
		exp_leftover INT NOT NULL,
		pending_stat_points INT NOT NULL,
		streak INT NOT NULL,
		equipped Equipped NOT NULL,
		inventory Inventory NOT NULL,
		friends INTEGER[] DEFAULT '{}' NOT NULL
	);

-- Table to store items
CREATE TABLE IF NOT EXISTS
	items (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		category VARCHAR(50) NOT NULL,
		rarity item_rarity NOT NULL,
		price INTEGER NOT NULL,
		asset_url TEXT
	);

-- Table to store item related info of users
CREATE TABLE IF NOT EXISTS
	user_items (
		user_id INTEGER NOT NULL REFERENCES users (id),
		item_id INTEGER NOT NULL REFERENCES items (id),
		acquired_at TIMESTAMP DEFAULT NOW() NOT NULL,
		PRIMARY KEY (user_id, item_id)
	);

-- Table to store user equipped items
CREATE TABLE IF NOT EXISTS
	user_equipment (
		user_id INTEGER PRIMARY KEY REFERENCES users (id),
		head INTEGER REFERENCES items (id),
		head_accessory INTEGER REFERENCES items (id),
		body INTEGER REFERENCES items (id),
		arms INTEGER REFERENCES items (id),
		weapon INTEGER REFERENCES items (id),
		background INTEGER REFERENCES items (id)
	);

-- ?
CREATE TABLE IF NOT EXISTS
	shop_rotations (
		id SERIAL PRIMARY KEY,
		item_id INTEGER NOT NULL REFERENCES items (id),
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
		user_id INTEGER NOT NULL REFERENCES users (id),
		name TEXT NOT NULL,
		exercises JSONB NOT NULL
	);

-- History
CREATE TABLE IF NOT EXISTS
	history (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users (id),
		name TEXT NOT NULL,
		exercises JSONB NOT NULL,
		date DATE NOT NULL,
		-- time TIME NOT NULL,         			
		duration INTEGER NOT NULL,
		points INTEGER NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	quests (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users (id),
		name TEXT NOT NULL,
		dificulty quest_dificulty NOT NULL,
		status quest_status NOT NULL,
		number_of_workouts_needed INTEGER NOT NULL,
		number_of_workouts_completed INTEGER NOT NULL,
		-- possible requierments
		workout_duration INTEGER,
		exercise_category EXERCISE_CATEGORY,
		exercise_muscle EXERCISE_MUSCLE
	);

-- Preseed data 
INSERT INTO
	classes (id, name, stats)
VALUES
	(1, 'Warrior', ROW (10, 7, 5)),
	(2, 'Monk', ROW (4, 7, 10)),
	(3, 'Assassin', ROW (5, 10, 6)),
	(4, 'Wizard', ROW (7, 7, 7)),
	(5, 'Gladiator', ROW (6, 5, 5));

INSERT INTO
	users (email, password, onboarding_complete)
VALUES
	(
		'you@example.com',
		crypt ('12345678', gen_salt ('md5')),
		TRUE
	);

INSERT INTO
	settings (user_id, first_name, last_name, workout_schedule)
VALUES
	(
		1,
		'John',
		'Doe',
		'{TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE}'
	);

INSERT INTO
	characters (
		user_id,
		username,
		class,
		level,
		exp_leftover,
		pending_stat_points,
		streak,
		equipped,
		inventory,
		friends
	)
VALUES
	(
		1,
		'JDoe',
		ROW ('Warrior', ROW (10, 7, 5)),
		1,
		0,
		0,
		0,
		ROW (0, 0, 0, 0, 0, 0, 0),
		ROW ('{0}', '{0}', '{0}', '{0}', '{0}', '{0}', '{0}'),
		'{}'
	);

-- \set exercises_json `cat /docker-entrypoint-initdb.d/exercises.json`;
DO $$
	DECLARE
  		exercises_json jsonb;
	BEGIN
		SELECT 
			pg_read_file('/docker-entrypoint-initdb.d/exercises.json')::jsonb INTO exercises_json;
		INSERT INTO
			exercises
		SELECT
			data ->> 'id',
			data ->> 'name',
			(data ->> 'force')::exercise_force,
			(data ->> 'level')::exercise_level,
			(data ->> 'mechanic')::exercise_mechanic,
			(data ->> 'equipment')::exercise_equipment,
			ARRAY (
				SELECT
					value::exercise_muscle
				FROM
					jsonb_array_elements_text(data -> 'primaryMuscles') AS value
			),
			ARRAY (
				SELECT
					value::exercise_muscle
				FROM
					jsonb_array_elements_text(data -> 'secondaryMuscles') AS value
			),
			ARRAY (
				SELECT
					value
				FROM
					jsonb_array_elements_text(data -> 'instructions') AS value
			),
			(data ->> 'category')::exercise_category,
			ARRAY (
				SELECT
					value
				FROM
					jsonb_array_elements_text(data -> 'images') AS value
			)
		FROM
			jsonb_array_elements(exercises_json) AS data;
END $$;
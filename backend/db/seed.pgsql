CREATE DATABASE gainzdb;

\c gainzdb;

CREATE ROLE dyredhead
WITH
	LOGIN;

CREATE EXTENSION pgcrypto;

CREATE TYPE stats AS (
	vitality INT,
	strength INT,
	endurance INT,
	agility INT
);

CREATE TYPE rarity_type AS ENUM (
    'common',
    'uncommon',
    'rare',
    'ultra rare',
    'mythical'
);

CREATE TYPE class AS (name TEXT, stats STATS);

-- Tables
CREATE TABLE IF NOT EXISTS
	users (
		id SERIAL PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL
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
		rarity rarity_type NOT NULL,
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

INSERT INTO
	classes (id, name, stats)
VALUES
	(1, 'Warrior', ROW (7, 9, 8, 5)),
	(2, 'Monk', ROW (7, 5, 6, 11)),
	(3, 'Assassin', ROW (7, 6, 7, 9)),
	(4, 'Wizard', ROW (7, 7, 8, 7)),
	(5, 'Gladiator', ROW (7, 8, 7, 7))
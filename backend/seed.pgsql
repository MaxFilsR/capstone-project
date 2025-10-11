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
		class CLASS,
		workout_schedule BOOL[7] NOT NULL
	);

CREATE TABLE IF NOT EXISTS
	items (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100),
		category VARCHAR(50),
		rarity VARCHAR(50),
		price INT,
		asset_url TEXT
	);

CREATE TABLE IF NOT EXISTS
	user_items (
		user_id INT REFERENCES users (id),
		item_id INT REFERENCES items (id),
		acquired_at TIMESTAMP DEFAULT NOW(),
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
		item_id INT REFERENCES items (id),
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
	(1, 'Assasin', ROW (0, 0, 0, 0)),
	(2, 'Gladiator', ROW (0, 0, 0, 0)),
	(3, 'Monk', ROW (0, 0, 0, 0)),
	(4, 'Warrior', ROW (0, 0, 0, 0)),
	(5, 'Wizard', ROW (0, 0, 0, 0))
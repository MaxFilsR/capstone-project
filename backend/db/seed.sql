CREATE DATABASE gainzdb;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) -- TODO: Change later to a more secure way of storing this info please
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  rarity VARCHAR(50),
  price INT,
  asset_url TEXT
);

CREATE TABLE IF NOT EXISTS user_items (
  user_id INT REFERENCES users(id),
  item_id INT REFERENCES items(id),
  acquired_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_equipment (
  user_id INT PRIMARY KEY REFERENCES users(id),
  head INT REFERENCES items(id),
  head_accessory INT REFERENCES items(id),
  body INT REFERENCES items(id),
  arms INT REFERENCES items(id),
  weapon INT REFERENCES items(id),
  background INT REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS shop_rotations (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES items(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP
);

CREATE DATABASE gainzdb;

CREATE TABLE IF NOT EXISTS users (
  ID SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  pass VARCHAR(255) -- TODO: Change later to a more secure way of storing this info please
);
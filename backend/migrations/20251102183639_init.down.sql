-- Add down migration script here
-- DELETE FROM users;
-- DELETE FROM user_info;
-- DELETE FROM items;
-- DELETE FROM user_items;
-- DELETE FROM user_equipment;
-- DELETE FROM shop_rotations;
-- DELETE FROM classes;
-- DELETE FROM exercies;
-- DELETE FROM routines;
-- DELETE FROM history;
-- DELETE FROM character;

DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "user_info";
DROP TABLE IF EXISTS "items";
DROP TABLE IF EXISTS "user_items";
DROP TABLE IF EXISTS "user_equipment";
DROP TABLE IF EXISTS "shop_rotations";
DROP TABLE IF EXISTS "classes";
DROP TABLE IF EXISTS "exercies";
DROP TABLE IF EXISTS "routines";
DROP TABLE IF EXISTS "history";
DROP TABLE IF EXISTS "character";

DROP TYPE IF EXISTS exercies;
DROP TYPE IF EXISTS stats;
DROP TYPE IF EXISTS class;
DROP TYPE IF EXISTS item_rarity;
DROP TYPE IF EXISTS exercies_force;
DROP TYPE IF EXISTS exercies_level;
DROP TYPE IF EXISTS exercise_mechanic;
DROP TYPE IF EXISTS exercise_equipment;
DROP TYPE IF EXISTS exercise_muscle;
DROP TYPE IF EXISTS exercise_category;


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
	(
		1,
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
		streak,
		equipped,
		inventory
	)
VALUES
	(
		1,
		'JDoe',
		ROW ('Warrior', ROW (10, 7, 5)),
		0,
		0,
		0,
		ROW (0, 0, 0, 0, 0, 0, 0),
		ROW ('{0}', '{0}', '{0}', '{0}', '{0}', '{0}', '{0}')
	);

-- Defining exercises
-- ToDo: Make sure it stores everything right
\set exercises_json `cat /docker-entrypoint-initdb.d/exercises.json`;

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
	jsonb_array_elements('exercises_json'::jsonb) AS data;
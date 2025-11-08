init:
	docker compose -f docker-compose.noapi.yml up -d
	sleep 5 # make it wait since it gets an error if it tries to run before the database is ready 
	cargo sqlx migrate run
	cargo sqlx prepare
	cargo test
	docker compose down

no-api:
	docker compose -f docker-compose.noapi.yml up -d

dev:
	docker compose -f compose.yaml -f docker-compose.dev.yml up -d

start:
	make init
	make dev

stop:
	-docker compose down
	-docker volume prune -af

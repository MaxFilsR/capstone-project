init:
	docker compose -f docker-compose.noapi.yml up -d
	cargo sqlx migrate run
	cargo sqlx prepare
	cargo test
	docker compose down

no-api:
	docker compose -f docker-compose.noapi.yml up -d

dev:
	docker compose -f compose.yaml -f docker-compose.dev.yml up -d

force-wipe:
	-docker compose down
	-pkill capstone-projec
	-docker volume prune -af
	-docker builder prune -af
	-docker rmi mjaramazovic/gainz-api

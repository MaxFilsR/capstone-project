# docker compose up
# 	--build: rebuilds the image if there were any changes
# 	--wait: waits for the container to be healthy before continuing
#	--detach: sends process to the background  

init:
	make no-api
	cargo sqlx migrate run
	cargo sqlx prepare
	cargo test
	docker compose down

no-api:
	docker compose --file docker-compose.noapi.yml up --build --wait --detach

dev:
	docker compose --file compose.yaml --file docker-compose.dev.yml up --build --wait --detach

psql:
	docker exec -it gainzdb psql -U postgres -d gainzdb

start:
	make init
	make dev

stop:
	-docker compose down
	-docker volume prune -af

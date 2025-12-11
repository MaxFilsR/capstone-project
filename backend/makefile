# docker compose up
# 	--build: rebuilds the image if there were any changes
# 	--wait: waits for the container to be healthy before continuing
#	--detach: sends process to the background  

# TODO: find the reaosn why the --env-file ./.env is necessary

init:
	make no-api
	cargo sqlx migrate run
	cargo sqlx prepare
	cargo test

no-api:
	docker compose --env-file ./.env --file ./docker/docker-compose.noapi.yml up --build --wait --detach

dev:
	docker compose --env-file ./.env --file ./docker/compose.yaml --file ./docker/docker-compose.dev.yml up --build --wait --detach

psql:
	docker exec -it gainzdb psql -U postgres -d gainzdb

start:
	make init
	make stop
	make dev

stop:
	-docker compose --env-file ./.env --file ./docker/docker-compose.noapi.yml down
	-docker compose --env-file ./.env --file ./docker/compose.yaml --file ./docker/docker-compose.dev.yml down
# remove all data from the postgres container 
	-docker volume prune -af 

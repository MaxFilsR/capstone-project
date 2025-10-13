start:
	docker compose -f 'compose.yaml' up -d --build 'db' --wait

connect:
	docker exec -it postgres_container psql -U postgres -d gainzdb

stop:
	-docker stop postgres_container
	-docker rm postgres_container
	-docker volume rm db_postgres_data
	-docker volume prune -f

restart: stop start
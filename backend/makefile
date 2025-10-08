db_start:
	sudo docker compose -f 'compose.yaml' up -d --build 'db' --wait

db_connect:
	sudo docker exec -it postgres_container psql -U postgres -d gainzdb

db_stop:
	sudo docker stop postgres_container 
	sudo docker rm postgres_container
	sudo docker volume rm backend_postgres_data

db_restart: db_stop db_start
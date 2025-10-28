start:
	docker compose up gainzdb &
	docker compose up gainzserver --build &

stop:
	-docker compose down
	-pkill capstone-projec
	-docker volume prune -af

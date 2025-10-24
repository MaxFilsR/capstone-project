start: start_backend start_frontend

start_backend:
	make --directory=./backend start &

start_frontend:
	make --directory=./frontend start &


stop: stop_backend stop_frontend

stop_backend:
	make --directory=./backend stop

stop_frontend:
	make --directory=./frontend stop

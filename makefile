start: start_backend 
# start_frontend wait_for_backend 

start_backend:
	make --directory=./backend start &
	
wait_for_backend:
	@echo "Waiting for backend to be ready"
	npx wait-on tcp:8080
	@echo "Backend is ready"

start_frontend:
	make --directory=./frontend start &


stop: stop_backend stop_frontend

stop_backend:
	make --directory=./backend stop

stop_frontend:
	make --directory=./frontend stop

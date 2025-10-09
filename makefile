all: compile 

compile: compile_backend compile_frontend 

compile_backend:
	make --directory=./backend compile 

compile_frontend:
	make --directory=./frontend compile 


start: start_backend start_frontend

start_backend:
	make --directory=./backend start

start_frontend:
	make --directory=./frontend start 


stop: stop_backend stop_frontend

stop_backend:
	make --directory=./backend stop

stop_frontend:
	make --directory=./frontend stop 
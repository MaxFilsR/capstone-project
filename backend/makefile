compile:
	make --directory=./db restart
	sleep 1
	cargo build

start:
# start database first
	make --directory=./db start
	sleep 1
# start webserver last
	cargo run

stop:
# stop web server first
	-kill $(lsof -n -i :8080 -t -sTCP:LISTEN)
# stop database last
	-make --directory=./db stop

compile: 
    just backend/compile
    just frontend/compile

start:
    just backend/start
    just frontend/start

stop:
    just backend/stop
    just frontend/stop
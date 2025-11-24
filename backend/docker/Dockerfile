# syntax=docker/dockerfile:1

ARG RUST_VERSION=1.90.0
ARG ACTIX_WEB_ADDRESS
ARG ACTIX_WEB_PORT
ARG JWT_SECRET_KEY
ARG APP_NAME=capstone-project

################################################################################
# Create a stage for building the application.

FROM rust:${RUST_VERSION}-alpine AS build
ENV SQLX_OFFLINE=true
ENV ACTIX_WEB_ADDRESS $ACTIX_WEB_ADDRESS 
ENV ACTIX_WEB_PORT $ACTIX_WEB_PORT
ENV JWT_SECRET_KEY $JWT_SECRET_KEY
ARG APP_NAME
WORKDIR /app

# Install host build dependencies.
RUN apk add --no-cache clang lld musl-dev git pkgconfig openssl-dev build-base perl openssl-libs-static

# Build the application.
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=.sqlx,target=.sqlx \
    --mount=type=bind,source=migrations,target=migrations \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    #DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PGPORT}/${POSTGRES_DB} 
    cargo build --locked --release && \ 
    cp ./target/release/$APP_NAME /bin/server

################################################################################
# Create a new stage for running the application

FROM alpine:3.18 AS final

# move items into docker container
COPY /assets/items/ /srv/items/

# Create a non-privileged user that the app will run under.
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser


USER appuser

# Copy the executable from the "build" stage.
COPY --from=build /bin/server /bin/

# Expose the port that the application listens on.
EXPOSE 8080

# What the container should run when it is started.
CMD ["/bin/server"]
# syntax=docker/dockerfile:1

ARG RUST_VERSION=1.90.0
ARG APP_NAME=capstone-project

################################################################################
# Create a stage for building the application.

FROM rust:${RUST_VERSION}-alpine AS build
ARG APP_NAME
WORKDIR /app

ARG PGHOST
ARG PGPORT
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB

# Install host build dependencies.
RUN apk add --no-cache clang lld musl-dev git pkgconfig openssl-dev build-base perl openssl-libs-static

# Build the application.
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PGPORT}/${POSTGRES_DB} cargo build --locked --release && \ 
    cp ./target/release/$APP_NAME /bin/server

################################################################################
# Create a new stage for running the application

FROM alpine:3.18 AS final

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

# Copy the exercises.json file BEFORE switching to appuser
COPY /exercises.json /app/exercises.json

USER appuser

# Copy the executable from the "build" stage.
COPY --from=build /bin/server /bin/

# Expose the port that the application listens on.
EXPOSE 5432

# What the container should run when it is started.
CMD ["/bin/server"]
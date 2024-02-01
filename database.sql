CREATE DATABASE IF NOT EXISTS auctions;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    balance BIGINT NOT NULL default 0,
    updated_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS valid_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    value BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    valid_code_id BIGINT NOT NULL,
    date_time TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (valid_code_id) REFERENCES valid_codes (id)
);
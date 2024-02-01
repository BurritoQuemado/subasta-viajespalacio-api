CREATE DATABASE IF NOT EXISTS auctions_palacio;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    balance BIGINT NOT NULL default 1500,
    quiz_try BOOLEAN default true,
    updated_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hash VARCHAR(255) NOT NULL
);
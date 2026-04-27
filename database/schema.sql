CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE student_details (
    user_id INT PRIMARY KEY,
    roll_no VARCHAR(50),
    department VARCHAR(100),
    year INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20),
    capacity INT,
    current_occupancy INT DEFAULT 0
);

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO roles (name) VALUES ('SuperAdmin'), ('Warden'), ('Security'), ('Student');
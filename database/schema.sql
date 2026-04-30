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
    room_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20),
    capacity INT,
    occupied INT DEFAULT 0
);

ALTER TABLE student_details
ADD CONSTRAINT fk_student_room
FOREIGN KEY (room_id) REFERENCES rooms(id);

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mess_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(20) UNIQUE NOT NULL,
    breakfast VARCHAR(255) NOT NULL,
    lunch VARCHAR(255) NOT NULL,
    dinner VARCHAR(255) NOT NULL
);

-- Seed Data
INSERT INTO roles (name) VALUES ('SuperAdmin'), ('Warden'), ('Security'), ('Student');
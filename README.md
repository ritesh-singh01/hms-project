# 🏨 Hostel Management System (HMS)

A full-stack web-based Hostel Management System built to manage students, rooms, notices, and mess timetable efficiently.

---

## 📌 Project Overview

This project is designed to simplify hostel administration by providing:

* Admin dashboard for managing students and rooms
* Student login to view notices and mess timetable
* Room allocation system with capacity control
* Notice board for announcements
* Mess timetable management

The system focuses on **clean UI, structured data handling, and role-based access**.

---

## 🚀 Features

### 🔐 Authentication

* Admin login
* Student login
* Role-based redirection

---

### 👨‍🎓 Student Management

* Add student
* Edit student details
* Delete student
* Search and filter students
* Assign / Remove room

---

### 🏠 Room Management

* Add rooms with capacity
* Track occupancy
* Assign students to rooms
* Prevent over-allocation

---

### 📢 Notices System

* Admin can add notices
* Admin can delete notices
* Students can view notices

---

### 🍽️ Mess Timetable

* Admin can add/update timetable
* Students can view timetable

---

### 🎨 UI/UX

* Modern dashboard layout
* Sidebar navigation
* Responsive table design
* Dropdown-based actions
* Clean and interactive UI

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

---

## 📂 Project Structure

```
hms-project/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── dashboard.html
│   ├── login.html
│   ├── student.html
│   ├── script.js
│   ├── login.js
│   └── style.css
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/ritesh-singh01/hms-project.git
cd hms-project
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Setup Database (MySQL)

Create database:

```
CREATE DATABASE hms_db;
```

Create required tables:

#### Users

```
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role_id INT
);
```

#### Students

```
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  roll_no VARCHAR(50),
  department VARCHAR(100),
  year INT,
  room_id INT
);
```

#### Rooms

```
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50),
  capacity INT,
  occupied INT DEFAULT 0
);
```

#### Notices

```
CREATE TABLE notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Mess Timetable

```
CREATE TABLE mess_menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day VARCHAR(20) UNIQUE,
  breakfast VARCHAR(255),
  lunch VARCHAR(255),
  dinner VARCHAR(255)
);
```

---

### 4. Configure Environment Variables

Create a `.env` file in backend:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hms_db
JWT_SECRET=secretkey
```

---

### 5. Run the server

```
npm start
```

Server runs at:

```
http://localhost:5000
```

---

### 6. Open frontend

Open in browser:

```
frontend/login.html
```

---

## 🔑 Default Roles

| Role    | role_id |
| ------- | ------- |
| Admin   | 1       |
| Student | 2       |

---

## 🧪 Testing Flow

* Login as admin → manage students, rooms, notices
* Add students and assign rooms
* Login as student → view notices & mess timetable

---

## 📈 Future Improvements

* Password hashing (bcrypt)
* JWT authentication middleware improvement
* Better UI animations
* Mobile responsiveness
* Email notifications
* Attendance or fee management

---

## 👨‍💻 Author

**Ritesh Singh**

---

## 📄 License

This project is for educational purposes.

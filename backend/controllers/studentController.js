const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.addStudent = async (req, res) => {
  const { name, email, password, roll_no, department, year } = req.body;

  if (!name || !email || !password || !roll_no || !department || !year) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [roleRows] = await conn.query(
      'SELECT id FROM roles WHERE name = ? LIMIT 1',
      ['Student']
    );

    if (roleRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Student role not found' });
    }

    const studentRoleId = roleRows[0].id;
    const passwordHash = await bcrypt.hash(password, 10);

    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, studentRoleId]
    );

    await conn.query(
      'INSERT INTO student_details (user_id, roll_no, department, year) VALUES (?, ?, ?, ?)',
      [userResult.insertId, roll_no, department, year]
    );

    await conn.commit();

    return res.status(201).json({
      message: 'Student added successfully',
      studentId: userResult.insertId
    });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }
    return res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        sd.roll_no,
        sd.department,
        sd.year
      FROM users u
      INNER JOIN student_details sd ON sd.user_id = u.id`
    );

    return res.json(students);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  const { id } = req.params;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can delete students' });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1. Delete from student_details
    await conn.query(
      'DELETE FROM student_details WHERE user_id = ?',
      [id]
    );

    // 2. Delete from users
    await conn.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    await conn.commit();

    res.json({ message: "Student deleted successfully" });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);   // 🔥 IMPORTANT
    res.status(500).json({ message: "Server error while deleting student" });
  } finally {
    if (conn) conn.release();
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, roll_no, department, year } = req.body;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can update students' });
  }

  if (!name || !email || !roll_no || !department || !year) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [userResult] = await conn.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );

    const [detailResult] = await conn.query(
      'UPDATE student_details SET roll_no = ?, department = ?, year = ? WHERE user_id = ?',
      [roll_no, department, year, id]
    );

    if (userResult.affectedRows === 0 || detailResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    await conn.commit();
    return res.json({ message: 'Student updated successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    return res.status(500).json({ error: err.message });
    console.error("UPDATE ERROR:", err);
  } finally {
    if (conn) conn.release();
  }
};

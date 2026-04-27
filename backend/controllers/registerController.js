const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role_id]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
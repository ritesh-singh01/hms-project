const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role_id || 2]
    );

    res.json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role_id, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role_id: user.role_id, name: user.name, message: 'Login successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
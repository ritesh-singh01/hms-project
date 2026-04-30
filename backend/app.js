const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected data",
    user: req.user
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: "success",
    message: "HMS Server is running"
  });
});

module.exports = app;
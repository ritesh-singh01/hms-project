const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Try DB connection (but don't block server)
db.getConnection()
  .then(conn => {
    console.log("✅ Database connected successfully");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

// ALWAYS start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
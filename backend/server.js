const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

db.getConnection()
  .then(conn => {
    console.log("Database connected successfully");
    conn.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err.message);
  });
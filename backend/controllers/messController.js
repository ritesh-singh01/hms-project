const db = require('../config/db');

exports.upsertTimetable = async (req, res) => {
  const { day, breakfast, lunch, dinner } = req.body;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can update mess timetable' });
  }

  if (!day || !breakfast || !lunch || !dinner) {
    return res.status(400).json({ message: 'Day, breakfast, lunch and dinner are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM mess_menu WHERE day = ? LIMIT 1', [day]);
    if (existing.length > 0) {
      await db.query(
        'UPDATE mess_menu SET breakfast = ?, lunch = ?, dinner = ? WHERE day = ?',
        [breakfast.trim(), lunch.trim(), dinner.trim(), day]
      );
      return res.json({ message: 'Mess timetable updated successfully' });
    }

    await db.query(
      'INSERT INTO mess_menu (day, breakfast, lunch, dinner) VALUES (?, ?, ?, ?)',
      [day, breakfast.trim(), lunch.trim(), dinner.trim()]
    );
    return res.status(201).json({ message: 'Mess timetable added successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while saving timetable' });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, day, breakfast, lunch, dinner FROM mess_menu ORDER BY FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), id'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while fetching timetable' });
  }
};

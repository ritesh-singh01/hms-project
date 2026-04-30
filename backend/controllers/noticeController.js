const db = require('../config/db');

exports.addNotice = async (req, res) => {
  const { title, content } = req.body;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can add notices' });
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO notices (title, content) VALUES (?, ?)',
      [title.trim(), content.trim()]
    );
    return res.status(201).json({ message: 'Notice added successfully', id: result.insertId });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while adding notice' });
  }
};

exports.getAllNotices = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, title, content, created_at FROM notices ORDER BY created_at DESC, id DESC'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while fetching notices' });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can delete notices' });
  }

  try {
    const [result] = await db.query('DELETE FROM notices WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    return res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while deleting notice' });
  }
};

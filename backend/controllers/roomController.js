const db = require('../config/db');

exports.addRoom = async (req, res) => {
  const { room_number, capacity } = req.body;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can add rooms' });
  }

  if (!room_number || !capacity) {
    return res.status(400).json({ message: 'Room number and capacity are required' });
  }

  const parsedCapacity = Number(capacity);
  if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
    return res.status(400).json({ message: 'Capacity must be a positive integer' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM rooms WHERE room_number = ? LIMIT 1',
      [room_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO rooms (room_number, capacity, occupied) VALUES (?, ?, 0)',
      [room_number, parsedCapacity]
    );

    return res.status(201).json({
      message: 'Room added successfully',
      roomId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while adding room' });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const [rooms] = await db.query(
      'SELECT id, room_number, capacity, occupied FROM rooms ORDER BY id DESC'
    );
    return res.json(rooms);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while fetching rooms' });
  }
};

exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can delete rooms' });
  }

  try {
    const [roomRows] = await db.query('SELECT occupied FROM rooms WHERE id = ? LIMIT 1', [id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (Number(roomRows[0].occupied) > 0) {
      return res.status(400).json({ message: 'Cannot delete an occupied room' });
    }

    await db.query('DELETE FROM rooms WHERE id = ?', [id]);
    return res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error while deleting room' });
  }
};

exports.assignStudentToRoom = async (req, res) => {
  const { student_id, room_id } = req.body;

  if (Number(req.user.role) !== 1) {
    return res.status(403).json({ message: 'Only admin can assign rooms' });
  }

  if (!student_id || !room_id) {
    return res.status(400).json({ message: 'student_id and room_id are required' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [studentRows] = await conn.query(
      'SELECT user_id, room_id FROM student_details WHERE user_id = ? LIMIT 1',
      [student_id]
    );
    if (studentRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    const [targetRoomRows] = await conn.query(
      'SELECT id, capacity, occupied FROM rooms WHERE id = ? LIMIT 1 FOR UPDATE',
      [room_id]
    );
    if (targetRoomRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Room not found' });
    }

    const targetRoom = targetRoomRows[0];
    if (Number(targetRoom.occupied) >= Number(targetRoom.capacity)) {
      await conn.rollback();
      return res.status(400).json({ message: 'Room is full' });
    }

    const currentRoomId = studentRows[0].room_id;

    if (currentRoomId && Number(currentRoomId) !== Number(room_id)) {
      await conn.query(
        'UPDATE rooms SET occupied = CASE WHEN occupied > 0 THEN occupied - 1 ELSE 0 END WHERE id = ?',
        [currentRoomId]
      );
    }

    await conn.query(
      'UPDATE student_details SET room_id = ? WHERE user_id = ?',
      [room_id, student_id]
    );

    if (!currentRoomId || Number(currentRoomId) !== Number(room_id)) {
      await conn.query(
        'UPDATE rooms SET occupied = occupied + 1 WHERE id = ?',
        [room_id]
      );
    }

    await conn.commit();
    return res.json({ message: 'Room assigned successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    return res.status(500).json({ message: err.message || 'Server error while assigning room' });
  } finally {
    if (conn) conn.release();
  }
};

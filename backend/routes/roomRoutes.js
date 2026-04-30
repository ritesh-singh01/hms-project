const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roomController = require('../controllers/roomController');

const router = express.Router();

router.post('/', authMiddleware, roomController.addRoom);
router.get('/', authMiddleware, roomController.getAllRooms);
router.delete('/:id', authMiddleware, roomController.deleteRoom);
router.post('/assign', authMiddleware, roomController.assignStudentToRoom);

module.exports = router;

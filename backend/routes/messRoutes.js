const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const messController = require('../controllers/messController');

const router = express.Router();

router.post('/', authMiddleware, messController.upsertTimetable);
router.get('/', authMiddleware, messController.getTimetable);

module.exports = router;

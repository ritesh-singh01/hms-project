const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const noticeController = require('../controllers/noticeController');

const router = express.Router();

router.post('/', authMiddleware, noticeController.addNotice);
router.get('/', authMiddleware, noticeController.getAllNotices);
router.delete('/:id', authMiddleware, noticeController.deleteNotice);

module.exports = router;

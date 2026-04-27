const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.post('/', authMiddleware, studentController.addStudent);
router.get('/', authMiddleware, studentController.getAllStudents);
router.delete('/:id', authMiddleware, studentController.deleteStudent);
router.put('/:id', authMiddleware, studentController.updateStudent);

module.exports = router;

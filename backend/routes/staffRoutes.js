const express = require('express');
const {
  getAssignedTasks,
  updateTaskStatus,
  getStaffProfile,
  createTask,
  getTaskStats
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/tasks', protect, authorize('staff'), getAssignedTasks);
router.put('/tasks/:id/status', protect, authorize('staff'), updateTaskStatus);
router.get('/profile', protect, authorize('staff'), getStaffProfile);
router.get('/tasks/stats', protect, authorize('staff'), getTaskStats);
router.post('/tasks/:staffId/create', protect, authorize('staff'), createTask);

module.exports = router;

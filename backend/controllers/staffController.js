const Task = require('../models/Task');
const Staff = require('../models/Staff');
const User = require('../models/User');

exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.userId })
      .populate('patient', 'name phone')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only assigned staff can update their own task
    if (task.assignedTo.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task.status = status || task.status;
    if (notes) task.notes = notes;

    await task.save();

    await task.populate('patient', 'name phone');
    await task.populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStaffProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({ userId: req.userId })
      .populate('userId', '-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff profile not found'
      });
    }

    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, taskType, patient, dueDate, priority } = req.body;

    const task = await Task.create({
      assignedTo: req.params.staffId,
      title,
      description,
      taskType,
      patient,
      dueDate,
      priority,
      createdBy: req.userId
    });

    await task.populate('patient', 'name phone');
    await task.populate('assignedTo', 'name');

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ assignedTo: req.userId });
    const completedTasks = await Task.countDocuments({ 
      assignedTo: req.userId, 
      status: 'completed' 
    });
    const pendingTasks = await Task.countDocuments({ 
      assignedTo: req.userId, 
      status: { $in: ['pending', 'in-progress'] }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

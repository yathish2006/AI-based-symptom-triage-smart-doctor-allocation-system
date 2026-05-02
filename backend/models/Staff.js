const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      required: true,
      enum: ['Reception', 'Nursing', 'Administration', 'Lab', 'Pharmacy']
    },
    position: String,
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night']
    },
    assignedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    hospitalAffiliation: String,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);

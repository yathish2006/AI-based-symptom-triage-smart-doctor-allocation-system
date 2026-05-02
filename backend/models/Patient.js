const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
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
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    medicalHistory: [
      {
        condition: String,
        date: Date
      }
    ],
    allergies: [String],
    currentMedications: [String],
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);

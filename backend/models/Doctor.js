const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
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
    license: {
      type: String,
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      required: true,
      enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Psychiatry', 'Emergency']
    },
    bio: String,
    experience: {
      type: Number,
      default: 0
    },
    qualifications: [String],
    hospitalAffiliation: String,
    consultationFee: {
      type: Number,
      default: 500
    },
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    },
    assignedPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    totalConsultations: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

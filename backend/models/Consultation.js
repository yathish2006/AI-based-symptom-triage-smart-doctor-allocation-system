const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symptoms: [
      {
        symptom: String,
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe']
        },
        duration: String
      }
    ],
    aiAnalysis: {
      potentialDiseases: [
        {
          disease: String,
          probability: Number
        }
      ],
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
      },
      isEmergency: Boolean,
      recommendations: [String]
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'urgent'],
      default: 'pending'
    },
    doctorNotes: String,
    prescription: [
      {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String
      }
    ],
    followUpDate: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);

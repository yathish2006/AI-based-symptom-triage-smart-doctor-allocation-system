const Patient = require('../models/Patient');
const User = require('../models/User');

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.userId })
      .populate('userId', '-password')
      .populate('assignedDoctor', 'name specialization');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const { dateOfBirth, gender, allergies, currentMedications, emergencyContact } = req.body;

    const patient = await Patient.findOne({ userId: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (allergies) patient.allergies = allergies;
    if (currentMedications) patient.currentMedications = currentMedications;
    if (emergencyContact) patient.emergencyContact = emergencyContact;

    await patient.save();

    await patient.populate('userId', '-password');
    await patient.populate('assignedDoctor', 'name specialization');

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addMedicalHistory = async (req, res) => {
  try {
    const { condition, date } = req.body;

    const patient = await Patient.findOne({ userId: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    patient.medicalHistory.push({
      condition,
      date: date || new Date()
    });

    await patient.save();

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

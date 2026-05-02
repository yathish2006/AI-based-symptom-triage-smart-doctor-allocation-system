const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Consultation = require('../models/Consultation');

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.userId })
      .populate('userId', '-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ })
      .populate('userId', 'name email phone')
      .select('specialization experience rating consultationFee availability');

    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

    const doctors = await Doctor.find({ specialization })
      .populate('userId', 'name email phone')
      .select('specialization experience rating consultationFee availability');

    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    // Get all consultations assigned to this doctor
    const consultations = await Consultation.find({ assignedDoctor: req.userId })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });

    // Extract unique patients
    const uniquePatients = {};
    const patients = [];
    
    consultations.forEach(consultation => {
      if (consultation.patientId && !uniquePatients[consultation.patientId._id]) {
        uniquePatients[consultation.patientId._id] = true;
        patients.push({
          ...consultation.patientId.toObject(),
          lastConsultation: consultation.createdAt
        });
      }
    });

    res.status(200).json({
      success: true,
      patients,
      totalPatients: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { bio, availability, qualifications } = req.body;

    const doctor = await Doctor.findOne({ userId: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    if (bio) doctor.bio = bio;
    if (availability) doctor.availability = availability;
    if (qualifications) doctor.qualifications = qualifications;

    await doctor.save();

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

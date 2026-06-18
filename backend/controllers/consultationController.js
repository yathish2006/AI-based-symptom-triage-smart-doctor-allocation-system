const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeSymptomsAI, getRequiredSpecialization, allocateBestDoctor } = require('../utils/helpers');

exports.createConsultation = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one symptom'
      });
    }

    // Analyze symptoms using AI
    const aiAnalysis = analyzeSymptomsAI(symptoms.map(s => s.symptom));

    // Determine required specialization based on symptoms
    const requiredSpecialization = getRequiredSpecialization(aiAnalysis.potentialDiseases);

    // Allocate best doctor using smart allocation logic
    let assignedDoctor = null;
    let allocatedDoctorRecord = null;
    
    const doctorRecord = await allocateBestDoctor(Doctor, requiredSpecialization, aiAnalysis.riskLevel);
    
    if (doctorRecord && doctorRecord.userId) {
      assignedDoctor = doctorRecord.userId._id;
      allocatedDoctorRecord = doctorRecord;
      
      // Add patient to doctor's assigned patients list
      if (!doctorRecord.assignedPatients.includes(req.userId)) {
        doctorRecord.assignedPatients.push(req.userId);
        await doctorRecord.save();
      }
    }

    // Create consultation with AI analysis
    const consultation = await Consultation.create({
      patientId: req.userId,
      symptoms,
      aiAnalysis,
      assignedDoctor,
      status: aiAnalysis.isEmergency ? 'urgent' : 'pending'
    });

    // Create notification for assigned doctor if one was allocated
    if (assignedDoctor) {
      const notificationType = aiAnalysis.isEmergency ? 'urgent_case' : 'new_consultation';
      const notificationTitle = aiAnalysis.isEmergency 
        ? '🚨 URGENT: Critical Patient Case Assigned' 
        : '📋 New Consultation Assigned';

      const symptomsText = symptoms.map(s => s.symptom).join(', ');
      const notificationMessage = 
        `New consultation from patient with symptoms: ${symptomsText}\n` +
        `Risk Level: ${aiAnalysis.riskLevel}\n` +
        `Primary diagnosis: ${aiAnalysis.potentialDiseases[0]?.disease || 'Pending assessment'}`;

      await Notification.create({
        doctorId: assignedDoctor,
        consultationId: consultation._id,
        patientId: req.userId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        symptoms: symptoms.map(s => s.symptom),
        riskLevel: aiAnalysis.riskLevel,
        isRead: false,
        isActionable: true
      });
    }

    // Populate doctor details for response
    await consultation.populate('assignedDoctor', 'name specialization rating hospitalAffiliation');
    
    // Get patient name for response
    const patient = await User.findById(req.userId).select('name phone email');

    res.status(201).json({
      success: true,
      consultation,
      assignedDoctorName: allocatedDoctorRecord?.userId?.name || 'No doctor available',
      assignedSpecialization: allocatedDoctorRecord?.specialization,
      message: aiAnalysis.isEmergency 
        ? '🚨 CRITICAL: Immediate medical attention required! Doctor has been notified.' 
        : `✅ Consultation created successfully! Dr. ${allocatedDoctorRecord?.userId?.name?.split(' ')[1] || 'will review'} has been notified and assigned to your case.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPatientConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patientId: req.userId })
      .populate('assignedDoctor', 'name specialization rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDoctorConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ assignedDoctor: req.userId })
      .populate('patientId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getConsultationDetails = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId')
      .populate('assignedDoctor');

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status, doctorNotes } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Only doctor can update consultation
    if (consultation.assignedDoctor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this consultation'
      });
    }

    consultation.status = status || consultation.status;
    consultation.doctorNotes = doctorNotes || consultation.doctorNotes;

    await consultation.save();

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { prescription } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Only doctor can add prescription
    if (consultation.assignedDoctor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription'
      });
    }

    consultation.prescription = prescription;
    await consultation.save();

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.rateConsultation = async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    if (consultation.patientId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the patient can rate this consultation'
      });
    }

    consultation.rating = rating;
    await consultation.save();

    res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all notifications for a doctor
exports.getDoctorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ doctorId: req.userId })
      .populate('patientId', 'name email phone')
      .populate('consultationId', 'symptoms aiAnalysis status')
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ 
      doctorId: req.userId, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.doctorId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      doctorId: req.userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

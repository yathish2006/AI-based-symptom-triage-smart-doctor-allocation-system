const express = require('express');
const {
  createConsultation,
  getPatientConsultations,
  getDoctorConsultations,
  getConsultationDetails,
  updateConsultationStatus,
  addPrescription,
  rateConsultation,
  getDoctorNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Patient routes
router.post('/create', protect, authorize('patient'), createConsultation);
router.get('/patient', protect, authorize('patient'), getPatientConsultations);
router.put('/:id/rating', protect, authorize('patient'), rateConsultation);

// Doctor routes
router.get('/doctor', protect, authorize('doctor'), getDoctorConsultations);
router.get('/:id', protect, getConsultationDetails);
router.put('/:id/status', protect, authorize('doctor'), updateConsultationStatus);
router.put('/:id/prescription', protect, authorize('doctor'), addPrescription);

// Doctor notification routes
router.get('/notifications/list', protect, authorize('doctor'), getDoctorNotifications);
router.get('/notifications/unread-count', protect, authorize('doctor'), getUnreadNotificationCount);
router.put('/notifications/:notificationId/read', protect, authorize('doctor'), markNotificationAsRead);

module.exports = router;

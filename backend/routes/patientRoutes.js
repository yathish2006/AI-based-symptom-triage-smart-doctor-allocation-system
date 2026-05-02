const express = require('express');
const {
  getPatientProfile,
  updatePatientProfile,
  addMedicalHistory
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, authorize('patient'), getPatientProfile);
router.put('/profile', protect, authorize('patient'), updatePatientProfile);
router.post('/medical-history', protect, authorize('patient'), addMedicalHistory);

module.exports = router;

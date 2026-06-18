const express = require('express');
const {
  getDoctorProfile,
  getAllDoctors,
  getDoctorsBySpecialization,
  getDoctorPatients,
  updateDoctorProfile
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/list', protect, getAllDoctors);
router.get('/specialization/:specialization', protect, getDoctorsBySpecialization);
router.get('/profile', protect, authorize('doctor'), getDoctorProfile);
router.get('/patients', protect, authorize('doctor'), getDoctorPatients);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;

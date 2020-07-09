const express = require('express');
const router = express.Router();
const {
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatients
} = require('../controllers/patient');

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getPatients).post(protect, authorize('publisher', 'admin'), createPatient);
router.route('/:id').get(getPatient).put(protect, authorize('publisher', 'admin'), updatePatient).delete(protect, authorize('publisher', 'admin'),deletePatient);

module.exports = router;

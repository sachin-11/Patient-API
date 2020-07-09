const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a full  name'],
  },
  patient: {
    type: Number,
    required: [true, 'Please add a Patient'],
  },
  vital_sign: {
    type: Number,
    required: [true, 'Please add a Vital sign']
  },
  value: {
    type: Number,
    default: true
  },
  note: {
   type: String,
   default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Patient', PatientSchema);

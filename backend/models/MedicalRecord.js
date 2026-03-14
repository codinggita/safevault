const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    condition: {
      type: String,
      required: [true, 'Medical condition is required'],
      trim: true,
    },
    medication: {
      type: String,
      default: '',
    },
    doctor: {
      type: String,
      default: '',
    },
    hospital: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

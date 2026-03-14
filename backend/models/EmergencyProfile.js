const mongoose = require('mongoose');

const emergencyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    allergies: {
      type: [String],
      default: [],
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    hospitalPreference: {
      type: String,
      default: '',
    },
    additionalNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyProfile', emergencyProfileSchema);

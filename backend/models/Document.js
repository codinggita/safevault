const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: [true, 'Document type is required'],
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Insurance', 'Other'],
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
    },
    issuer: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);

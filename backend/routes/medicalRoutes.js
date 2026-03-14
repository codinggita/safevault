const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect } = require('../middleware/authMiddleware');

// GET all medical records
router.get('/', protect, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create medical record
router.post('/', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.create({ ...req.body, user: req.user.id });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update medical record
router.put('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE medical record
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Medical record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

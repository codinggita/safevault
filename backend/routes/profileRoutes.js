const express = require('express');
const router = express.Router();
const EmergencyProfile = require('../models/EmergencyProfile');
const { protect } = require('../middleware/authMiddleware');

// @route  GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    const profile = await EmergencyProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/profile
router.put('/', protect, async (req, res) => {
  try {
    const { bloodGroup, allergies, medicalConditions, hospitalPreference, additionalNotes } = req.body;
    const profile = await EmergencyProfile.findOneAndUpdate(
      { user: req.user.id },
      { bloodGroup, allergies, medicalConditions, hospitalPreference, additionalNotes },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

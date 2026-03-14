const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { protect } = require('../middleware/authMiddleware');

// GET all documents
router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create document
router.post('/', protect, async (req, res) => {
  try {
    const document = await Document.create({ ...req.body, user: req.user.id });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update document
router.put('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE document
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

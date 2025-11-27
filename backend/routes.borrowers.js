const express = require('express');
const Borrower = require('./models.Borrower');

const router = express.Router();

// Create borrower
router.post('/', async (req, res) => {
  try {
    const borrower = new Borrower(req.body);
    await borrower.save();
    res.status(201).json(borrower);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all borrowers
router.get('/', async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more borrower routes as needed

module.exports = router;

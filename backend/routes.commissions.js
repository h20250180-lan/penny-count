const express = require('express');
const Commission = require('./models.Commission');

const router = express.Router();

// Create commission
router.post('/', async (req, res) => {
  try {
    const commission = new Commission(req.body);
    await commission.save();
    res.status(201).json(commission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all commissions
router.get('/', async (req, res) => {
  try {
    const commissions = await Commission.find();
    res.json(commissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more commission routes as needed

module.exports = router;

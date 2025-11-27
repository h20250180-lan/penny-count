const express = require('express');
const Payment = require('./models.Payment');

const router = express.Router();

// Create payment
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more payment routes as needed

module.exports = router;

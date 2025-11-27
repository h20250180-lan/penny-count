const express = require('express');
const Loan = require('./models.Loan');
const { authenticate, authorizeRoles } = require('./middleware.auth');

const router = express.Router();

// Create loan (agents and owners)
router.post('/', authenticate, authorizeRoles('owner', 'agent'), async (req, res) => {
  try {
    const payload = { ...req.body };
    // If agent is creating, ensure line belongs to them
    if (req.user.role === 'agent' && payload.lineId) {
      const LineModel = require('./models.Line');
      const line = await LineModel.findById(payload.lineId);
      if (!line) return res.status(404).json({ message: 'Line not found' });
      if (String(line.agentId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Forbidden: cannot create loan for unassigned line' });
      }
    }

    const loan = new Loan(payload);
    await loan.save();

    // Update line metrics: increment totalDisbursed and currentBalance
    if (loan.lineId) {
      try {
        const LineModel = require('./models.Line');
        await LineModel.findByIdAndUpdate(loan.lineId, {
          $inc: { totalDisbursed: loan.amount, currentBalance: loan.amount }
        });
      } catch (e) {
        console.error('Failed to update line metrics after loan creation', e);
      }
    }

    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more loan routes as needed

module.exports = router;

const express = require('express');
const Line = require('./models.Line');
const { authenticate, authorizeRoles } = require('./middleware.auth');

const router = express.Router();

// Create line (owners and co-owners)
router.post('/', authenticate, authorizeRoles('owner', 'co-owner'), async (req, res) => {
  try {
    console.log('POST /api/lines incoming body:', req.body, 'by user', req.user && req.user.id);
    // Defensive: coerce numeric fields that may arrive as strings from the frontend
    const payload = { ...req.body };
    if (payload.initialCapital !== undefined) payload.initialCapital = Number(payload.initialCapital) || 0;
    if (payload.currentBalance !== undefined) payload.currentBalance = Number(payload.currentBalance) || 0;
    if (payload.totalDisbursed !== undefined) payload.totalDisbursed = Number(payload.totalDisbursed) || 0;
    if (payload.totalCollected !== undefined) payload.totalCollected = Number(payload.totalCollected) || 0;
    if (payload.borrowerCount !== undefined) payload.borrowerCount = Number(payload.borrowerCount) || 0;
    if (payload.interestRate !== undefined) payload.interestRate = Number(payload.interestRate) || 0;
    if (payload.defaultTenure !== undefined) payload.defaultTenure = Number(payload.defaultTenure) || 0;

    // If ownerId wasn't provided but a JWT-authenticated user exists, set it
    // Note: keep optional to allow scripts to set ownerId explicitely
    if (!payload.ownerId && req.user && req.user.id) {
      payload.ownerId = req.user.id;
    }

    const line = new Line(payload);
    await line.save();
    console.log('POST /api/lines saved line:', line);
    res.status(201).json(line);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all lines
router.get('/', async (req, res) => {
  try {
    // Aggregate across loans, payments, and borrowers to compute live metrics
    const lines = await Line.aggregate([
      // join loans
      {
        $lookup: {
          from: 'loans',
          localField: '_id',
          foreignField: 'lineId',
          as: 'loans'
        }
      },
      // join borrowers
      {
        $lookup: {
          from: 'borrowers',
          localField: '_id',
          foreignField: 'lineId',
          as: 'borrowers'
        }
      },
      // compute sums from loans
      {
        $addFields: {
          totalDisbursed: { $sum: '$loans.amount' },
          totalRemaining: { $sum: '$loans.remainingAmount' },
          borrowerCount: { $size: '$borrowers' }
        }
      },
      // join payments aggregated by loans
      {
        $lookup: {
          from: 'payments',
          let: { loanIds: '$loans._id' },
          pipeline: [
            { $match: { $expr: { $in: ['$loanId', '$$loanIds'] } } },
            { $group: { _id: null, totalCollected: { $sum: '$amount' } } }
          ],
          as: 'paymentsAgg'
        }
      },
      // finalize fields
      {
        $addFields: {
          totalCollected: { $ifNull: [ { $arrayElemAt: ['$paymentsAgg.totalCollected', 0] }, 0 ] },
          currentBalance: {
            $cond: [
              { $gt: [ { $size: '$loans' }, 0 ] },
              { $ifNull: [ '$totalRemaining', { $subtract: [ { $ifNull: [ '$totalDisbursed', 0 ] }, { $ifNull: [ { $arrayElemAt: ['$paymentsAgg.totalCollected', 0] }, 0 ] } ] } ] },
              0
            ]
          }
        }
      },
      // remove heavy lookups
      {
        $project: { loans: 0, borrowers: 0, paymentsAgg: 0 }
      }
    ]);
    res.json(lines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more line routes as needed

// Update a line (owners can update any line; co-owners can update lines they co-own)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid line id' });
    }
    const requester = req.user; // { id, role }
    const existing = await Line.findById(id);
    if (!existing) return res.status(404).json({ message: 'Line not found' });

    // Authorization: owner can edit any; co-owner can edit if they are coOwnerId; agents cannot edit
    if (requester.role !== 'owner') {
      if (requester.role === 'co-owner') {
        if (!existing.coOwnerId || String(existing.coOwnerId) !== String(requester.id)) {
          return res.status(403).json({ message: 'Forbidden: not owner or assigned co-owner' });
        }
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const updates = { ...req.body };
    // Coerce numeric updates
    if (updates.initialCapital !== undefined) updates.initialCapital = Number(updates.initialCapital) || 0;
    if (updates.currentBalance !== undefined) updates.currentBalance = Number(updates.currentBalance) || 0;
    if (updates.totalDisbursed !== undefined) updates.totalDisbursed = Number(updates.totalDisbursed) || 0;
    if (updates.totalCollected !== undefined) updates.totalCollected = Number(updates.totalCollected) || 0;
    if (updates.borrowerCount !== undefined) updates.borrowerCount = Number(updates.borrowerCount) || 0;
    // Allow unsetting coOwnerId/agentId when client sends null
    if (Object.prototype.hasOwnProperty.call(updates, 'coOwnerId')) {
      if (updates.coOwnerId === null || updates.coOwnerId === 'null' || updates.coOwnerId === '') {
        updates.coOwnerId = null;
      }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'agentId')) {
      if (updates.agentId === null || updates.agentId === 'null' || updates.agentId === '') {
        updates.agentId = null;
      }
    }
    // If initialCapital changed and currentBalance not explicitly provided, set currentBalance to the new initialCapital
    if (Object.prototype.hasOwnProperty.call(updates, 'initialCapital') && !Object.prototype.hasOwnProperty.call(updates, 'currentBalance')) {
      updates.currentBalance = updates.initialCapital;
    }
    const updated = await Line.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a line (owners only)
router.delete('/:id', authenticate, authorizeRoles('owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Line.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: 'Line not found' });
    res.json({ message: 'Line deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

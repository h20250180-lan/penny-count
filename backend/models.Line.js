const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Financial / metrics fields expected by the frontend
  initialCapital: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  totalDisbursed: { type: Number, default: 0 },
  totalCollected: { type: Number, default: 0 },
  borrowerCount: { type: Number, default: 0 },

  // Operational fields
  isActive: { type: Boolean, default: true },
  interestRate: { type: Number, default: 2.5 },
  defaultTenure: { type: Number, default: 30 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Line', lineSchema);

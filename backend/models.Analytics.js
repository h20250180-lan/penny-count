const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalDisbursed: Number,
  totalCollected: Number,
  activeLoans: Number,
  overdueLoans: Number,
  collectionEfficiency: Number,
  profit: Number,
  cashOnHand: Number,
  defaultRate: Number,
  avgLoanSize: Number
});

module.exports = mongoose.model('Analytics', analyticsSchema);

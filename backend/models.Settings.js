const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  defaultInterestRate: { type: Number, default: 12 },
  defaultTenure: { type: Number, default: 30 },
  latePaymentFine: { type: Number, default: 100 },
  missedPaymentFine: { type: Number, default: 200 },
  partialPaymentFine: { type: Number, default: 50 },
  commissionRate: { type: Number, default: 2 },
  maxLoanAmount: { type: Number, default: 100000 },
  minLoanAmount: { type: Number, default: 1000 }
});

module.exports = mongoose.model('Settings', settingsSchema);

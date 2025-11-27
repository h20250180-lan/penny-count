const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  collectedAt: { type: Date, default: Date.now },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Collection', collectionSchema);

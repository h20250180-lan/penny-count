const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  lineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Line' },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in days
  repaymentFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'completed', 'overdue', 'defaulted'], default: 'active' },
  disbursedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Loan', loanSchema);

const express = require('express');
const mongoose = require('mongoose');
const Loan = require('./models.Loan');
const Payment = require('./models.Payment');
const Line = require('./models.Line');
const Analytics = require('./models.Analytics');

const router = express.Router();

// Compute analytics on demand. Accepts optional query params: userId and role
// - owner: scope to lines where ownerId === userId
// - co-owner: scope to lines where coOwnerId === userId
// - agent: scope to lines where agentId === userId
router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.query;

    // Build line filter based on role
    const lineFilter = {};
    const isObjectIdString = (id) => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/);
    if (role === 'owner' && userId && isObjectIdString(userId)) lineFilter.ownerId = new mongoose.Types.ObjectId(String(userId));
    if (role === 'co-owner' && userId && isObjectIdString(userId)) lineFilter.coOwnerId = new mongoose.Types.ObjectId(String(userId));
    if (role === 'agent' && userId && isObjectIdString(userId)) lineFilter.agentId = new mongoose.Types.ObjectId(String(userId));

    // Find relevant lines
    const lines = await Line.find(lineFilter).lean();
    const lineIds = lines.map(l => l._id);

    // Aggregate loans in scope
    const loanMatch = lineIds.length ? { lineId: { $in: lineIds } } : {};
    const loansAgg = await Loan.aggregate([
      { $match: loanMatch },
      { $group: { _id: null, totalDisbursed: { $sum: '$amount' }, activeLoans: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }, overdueLoans: { $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $gt: ['$remainingAmount', 0] }] }, 1, 0] } } } }
    ]);
    const loanStats = loansAgg[0] || { totalDisbursed: 0, activeLoans: 0, overdueLoans: 0 };

    // Aggregate payments in scope
    const paymentsAgg = await Payment.aggregate([
      // join payments by loan scope: find payments whose loanId belongs to loans in scope
      { $lookup: { from: 'loans', localField: 'loanId', foreignField: '_id', as: 'loan' } },
      { $unwind: { path: '$loan', preserveNullAndEmptyArrays: true } },
      ...(lineIds.length ? [{ $match: { 'loan.lineId': { $in: lineIds } } }] : []),
      { $group: { _id: null, totalCollected: { $sum: '$amount' } } }
    ]);
    const paymentStats = paymentsAgg[0] || { totalCollected: 0 };

    // Compute cashOnHand using lines' initialCapital and aggregated loan/payment sums
    const totalInitial = lines.reduce((s, l) => s + (Number(l.initialCapital) || 0), 0);
    const totalDisbursed = loanStats.totalDisbursed || 0;
    const totalCollected = paymentStats.totalCollected || 0;
    const cashOnHand = totalInitial - totalDisbursed + totalCollected;

    const collectionEfficiency = totalDisbursed > 0 ? Math.round((totalCollected / totalDisbursed) * 100) : 0;

    // Recent activity: fetch most recent loans and payments in scope
    const recentLoans = await Loan.find(lineIds.length ? { lineId: { $in: lineIds } } : {}).sort({ disbursedAt: -1 }).limit(5).lean();
    const recentPayments = await Payment.find({}).sort({ paidAt: -1 }).lean();
    // filter recentPayments by loan scope if needed
    const recentPaymentsFiltered = lineIds.length ? recentPayments.filter(p => p.loanId && lineIds.some(id => String(id) === String(p.loanId))) : recentPayments;

    const recentActivity = [];
    recentLoans.forEach(l => recentActivity.push({ type: 'loan', date: l.disbursedAt || l.createdAt, item: l }));
    recentPaymentsFiltered.slice(0, 5).forEach(p => recentActivity.push({ type: 'payment', date: p.paidAt || p.createdAt, item: p }));
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const activity = recentActivity.slice(0, 10);

    const metrics = {
      totalDisbursed: totalDisbursed || 0,
      totalCollected: totalCollected || 0,
      activeLoans: loanStats.activeLoans || 0,
      overdueLoans: loanStats.overdueLoans || 0,
      collectionEfficiency,
      cashOnHand,
      recentActivity: activity
    };

    // Optionally persist a snapshot (not required)
    try {
      await Analytics.create({ ...metrics });
    } catch (e) {
      // ignore persistence errors
    }

    res.json(metrics);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

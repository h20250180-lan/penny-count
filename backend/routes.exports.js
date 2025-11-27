const express = require('express');
const Line = require('./models.Line');
const Loan = require('./models.Loan');
const Payment = require('./models.Payment');
const User = require('./models.User');
const mongoose = require('mongoose');

const router = express.Router();

// POST /api/exports
// body: { lineIds?: string[], agentIds?: string[], startDate?: string, endDate?: string, format?: 'csv'|'pdf' }
router.post('/', async (req, res) => {
  try {
    const { lineIds, agentIds, startDate, endDate, format } = req.body || {};

    // Determine lines to include
    let lines = [];
    if (Array.isArray(lineIds) && lineIds.length) {
      const ids = lineIds.filter(Boolean).map(id => mongoose.Types.ObjectId(String(id)));
      lines = await Line.find({ _id: { $in: ids } }).lean();
    } else {
      // if none specified, export all lines
      lines = await Line.find().lean();
    }

    // Filter by agentIds if provided
    if (Array.isArray(agentIds) && agentIds.length) {
      const aSet = new Set(agentIds.map(String));
      lines = lines.filter(l => l.agentId && aSet.has(String(l.agentId)));
    }

    // Date range filters
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Gather agents map
    const agentIdsFromLines = Array.from(new Set(lines.map(l => l.agentId).filter(Boolean).map(String)));
    const agents = agentIdsFromLines.length ? await User.find({ _id: { $in: agentIdsFromLines } }).lean() : [];
    const agentMap = new Map(agents.map(a => [String(a._id), a]));

    // For each line, fetch loans and related payments within date range
    const rows = [];
    for (const line of lines) {
      const loanMatch = { lineId: line._id };
      if (start) loanMatch.disbursedAt = { $gte: start };
      if (end) loanMatch.disbursedAt = loanMatch.disbursedAt ? { ...loanMatch.disbursedAt, $lte: end } : { $lte: end };
      const loans = await Loan.find(loanMatch).lean();
      const loanIds = loans.map(l => l._id);
      const payments = loanIds.length ? await Payment.find({ loanId: { $in: loanIds }, ...(start || end ? { paidAt: { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) } } : {}) }).lean() : [];

      // Build flattened rows per loan
      for (const loan of loans) {
        const loanPayments = payments.filter(p => String(p.loanId) === String(loan._id));
        const paidSum = loanPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        rows.push({
          lineId: String(line._id),
          lineName: line.name,
          agentId: line.agentId ? String(line.agentId) : '',
          agentName: line.agentId ? (agentMap.get(String(line.agentId)) || {}).name || '' : '',
          lineInitialCapital: line.initialCapital || 0,
          loanId: String(loan._id),
          borrowerId: String(loan.borrowerId || ''),
          amount: loan.amount || 0,
          totalAmount: loan.totalAmount || 0,
          paidAmount: loan.paidAmount || paidSum || 0,
          remainingAmount: loan.remainingAmount || 0,
          status: loan.status || '',
          disbursedAt: loan.disbursedAt ? new Date(loan.disbursedAt).toISOString() : '',
          dueDate: loan.dueDate ? new Date(loan.dueDate).toISOString() : ''
        });
      }

      // If no loans, still emit a line-level row
      if (loans.length === 0) {
        rows.push({
          lineId: String(line._id),
          lineName: line.name,
          agentId: line.agentId ? String(line.agentId) : '',
          agentName: line.agentId ? (agentMap.get(String(line.agentId)) || {}).name || '' : '',
          lineInitialCapital: line.initialCapital || 0,
          loanId: '',
          borrowerId: '',
          amount: 0,
          totalAmount: 0,
          paidAmount: 0,
          remainingAmount: 0,
          status: '',
          disbursedAt: '',
          dueDate: ''
        });
      }
    }

    // Generate CSV
    const headers = [
      'lineId','lineName','agentId','agentName','lineInitialCapital','loanId','borrowerId','amount','totalAmount','paidAmount','remainingAmount','status','disbursedAt','dueDate'
    ];
    const escapeCsv = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    let csv = headers.join(',') + '\n';
    for (const r of rows) {
      csv += headers.map(h => escapeCsv(r[h])).join(',') + '\n';
    }

    const filename = `pennycount_export_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

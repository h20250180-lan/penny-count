const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  geolocation: {
    lat: Number,
    lng: Number
  },
  isHighRisk: { type: Boolean, default: false },
  isDefaulter: { type: Boolean, default: false },
  totalLoans: { type: Number, default: 0 },
  activeLoans: { type: Number, default: 0 },
  totalRepaid: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Line' }
});

module.exports = mongoose.model('Borrower', borrowerSchema);

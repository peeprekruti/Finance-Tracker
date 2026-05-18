const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false, // Make it optional for MVP
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'sms'],
    default: 'manual',
  },
  paymentMethod: {
    type: String,
    default: 'Credit Card',
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

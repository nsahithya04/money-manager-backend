const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  division: { type: String, enum: ['Office', 'Personal'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  editableUntil: { type: Date, default: () => new Date(Date.now() + 12 * 60 * 60 * 1000) } // 12 hours
});

module.exports = mongoose.model('Transaction', transactionSchema);

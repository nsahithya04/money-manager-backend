const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://your-cluster...');
mongoose.connection.once('open', () => console.log('✅ MongoDB Connected!'));

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  division: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Routes
app.get('/api/stats', async (req, res) => {
  const income = await Transaction.aggregate([
    { $match: { type: 'income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const expense = await Transaction.aggregate([
    { $match: { type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  res.json({
    income: income[0]?.total || 0,
    expense: expense[0]?.total || 0,
    net: (income[0]?.total || 0) - (expense[0]?.total || 0)
  });
});

app.get('/api/transactions', async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1 });
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.json(transaction);
});

app.put('/api/transactions/:id', async (req, res) => {
  const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(transaction);
});

app.delete('/api/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
// ADD THIS ENDPOINT (before app.listen)
app.get('/api/stats', async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'income'] },
                '$amount',
                0
              ]
            }
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'expense'] },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = result[0] || { income: 0, expense: 0 };
    res.json({
      income: stats.income,
      expense: stats.expense,
      net: stats.income - stats.expense
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

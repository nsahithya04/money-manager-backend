const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Render)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'income' or 'expense'
  division: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// ========== API ENDPOINTS ==========

// 1. GET /api/stats - Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. GET /api/transactions - Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. POST /api/transactions - Add new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. PUT /api/transactions/:id - Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. DELETE /api/transactions/:id - Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API is LIVE!' });
});

// CRITICAL: Render port binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware - MUST HAVE
app.use(cors());
app.use(express.json());

// In-memory storage (no database needed)
let transactions = [];

// ✅ ROUTE 1: Test server
app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API is LIVE!' });
});

// ✅ ROUTE 2: Dashboard stats
app.get('/api/stats', (req, res) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  res.json({
    income: Math.round(income),
    expense: Math.round(expense),
    net: Math.round(income - expense)
  });
});

// ✅ ROUTE 3: Get all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// ✅ ROUTE 4: Add transaction
app.post('/api/transactions', (req, res) => {
  const transaction = {
    _id: Date.now().toString(),
    ...req.body,
    date: new Date(req.body.date || Date.now())
  };
  transactions.unshift(transaction); // Add to beginning
  res.status(201).json(transaction);
});

// ✅ ROUTE 5: Update transaction
app.put('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...req.body };
    res.json(transactions[index]);
  } else {
    res.status(404).json({ error: 'Transaction not found' });
  }
});

// ✅ ROUTE 6: Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  transactions = transactions.filter(t => t._id !== req.params.id);
  res.json({ message: 'Transaction deleted successfully' });
});

// 🚀 RENDER.COM PORT BINDING - CRITICAL
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

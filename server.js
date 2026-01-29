const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory data (no MongoDB needed)
let transactions = [];

// API ROUTES
app.get('/api/stats', (req, res) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions  
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  res.json({ income, expense, net: income - expense });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const transaction = { _id: Date.now().toString(), ...req.body, date: new Date(req.body.date) };
  transactions.push(transaction);
  res.json(transaction);
});

app.put('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t._id === req.params.id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...req.body };
    res.json(transactions[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  transactions = transactions.filter(t => t._id !== req.params.id);
  res.json({ message: 'Deleted' });
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API LIVE!' });
});

// Render port
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on port ${PORT}`);
});

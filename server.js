const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data + PRE-POPULATE
let transactions = [
  {
    _id: "1",
    type: "income",
    division: "Personal",
    category: "Salary",
    amount: 20000,
    description: "Monthly salary",
    date: new Date().toISOString()
  },
  {
    _id: "2",
    type: "expense",
    division: "Personal",
    category: "Food",
    amount: 2000,
    description: "Groceries",
    date: new Date().toISOString()
  }
];

// ROUTES
app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API LIVE! 🚀' });
});

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
  const transaction = {
    _id: Date.now().toString(),
    type: req.body.type || 'income',
    division: req.body.division || 'Personal',
    category: req.body.category || 'Other',
    amount: Number(req.body.amount) || 0,
    description: req.body.description || '',
    date: new Date().toISOString()
  };
  transactions.unshift(transaction);
  res.status(201).json(transaction);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server on port ${PORT}`);
});

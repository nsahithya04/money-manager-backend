const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas - REPLACE WITH YOUR CONNECTION STRING
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/money-manager')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: String,
  division: String,
  category: String,
  amount: Number,
  description: String,
  date: Date
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// PRE-POPULATE DEMO DATA (Runs once on startup)
async function populateDemoData() {
  try {
    const count = await Transaction.countDocuments();
    if (count === 0) {
      await Transaction.insertMany([
        {
          _id: "1",
          type: "income",
          division: "Personal",
          category: "Salary",
          amount: 20000,
          description: "Monthly salary",
          date: new Date()
        },
        {
          _id: "2",
          type: "expense",
          division: "Personal",
          category: "Food",
          amount: 2000,
          description: "Groceries",
          date: new Date()
        }
      ]);
      console.log('✅ Demo data populated!');
    }
  } catch (error) {
    console.log('Demo data error:', error);
  }
}

// Call populate after MongoDB connects
mongoose.connection.on('connected', populateDemoData);

// API ROUTES
app.get('/', (req, res) => {
  res.json({ message: 'Money Manager API LIVE! 🚀' });
});

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
  console.log('POST DATA:', req.body);
  const transaction = new Transaction({
    type: req.body.type || 'income',
    division: req.body.division || 'Personal',
    category: req.body.category || 'Other',
    amount: Number(req.body.amount) || 0,
    description: req.body.description || '',
    date: new Date(req.body.date || Date.now())
  });
  await transaction.save();
  console.log('SAVED:', transaction);
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', async (req, res) => {
  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(transaction);
});

app.delete('/api/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Transaction deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions with filters
router.get('/', async (req, res) => {
  try {
    const { division, category, startDate, endDate } = req.query;
    let query = {};
    
    if (division && division !== 'All') query.division = division;
    if (category && category !== 'All') query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE transaction (only within 12 hours)
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (new Date() > transaction.editableUntil) {
      return res.status(400).json({ error: 'Cannot edit after 12 hours' });
    }
    
    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE transaction (only within 12 hours)
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (new Date() > transaction.editableUntil) {
      return res.status(400).json({ error: 'Cannot delete after 12 hours' });
    }
    
    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

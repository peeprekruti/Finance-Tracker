require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Transaction = require('./models/Transaction');
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Fallback Data
let memoryDb = [];

// For local MVP we will use a local MongoDB connection or fallback to a dummy memory array (if user's mongo is not setup).
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance_tracker';

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('MongoDB connection failed. Using Temporary In-Memory Database.');
  });

// Helper to check DB status
const isMongoConnected = () => mongoose.connection.readyState === 1;

// --- ROUTES ---

// GET /api/transactions
app.get('/api/transactions', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const transactions = await Transaction.find().sort({ date: -1 });
      res.json(transactions);
    } else {
      res.json([...memoryDb].reverse());
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
app.post('/api/transactions', async (req, res) => {
  try {
    let { amount, category, note, paymentMethod, source, date } = req.body;
    
    if (!category && note) {
      const aiResult = await aiService.categorizeExpense(note);
      category = aiResult.category;
    }
    
    const txDate = date ? new Date(date) : new Date();

    if (!isMongoConnected()) {
      const mockTx = {
        _id: Math.random().toString(36).substr(2, 9),
        amount: Number(amount),
        category: category || 'Uncategorized',
        note,
        paymentMethod,
        source: source || 'manual',
        date: txDate
      };
      memoryDb.push(mockTx);
      return res.status(201).json(mockTx);
    }

    const newTx = new Transaction({
      amount: Number(amount),
      category: category || 'Uncategorized',
      note,
      paymentMethod,
      source: source || 'manual',
      date: txDate
    });
    
    const savedTx = await newTx.save();
    res.status(201).json(savedTx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Transaction.findByIdAndDelete(id);
    } else {
      memoryDb = memoryDb.filter(tx => tx._id !== id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// DELETE /api/transactions
app.delete('/api/transactions', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Transaction.deleteMany({});
    } else {
      memoryDb = [];
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear transactions' });
  }
});

// POST /api/insights/categorize (Explicit categorization check)
app.post('/api/insights/categorize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });
    const result = await aiService.categorizeExpense(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Categorization failed' });
  }
});

// GET /api/insights
app.get('/api/insights', async (req, res) => {
  try {
    let transactions;
    if (isMongoConnected()) {
      transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    } else {
      transactions = [...memoryDb].reverse().slice(0, 100);
    }

    const result = await aiService.generateInsights(transactions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Insights generation failed' });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    
    let transactions;
    if (isMongoConnected()) {
      transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    } else {
      transactions = [...memoryDb].reverse().slice(0, 100);
    }

    const result = await aiService.generateChatResponse(query, transactions);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

// POST /api/sms/webhook (Simulation of SMS ingestion)
app.post('/api/sms/webhook', async (req, res) => {
  try {
    const { smsText } = req.body;
    if (!smsText) return res.status(400).json({ error: "smsText is required" });

    const amountMatch = smsText.match(/Rs\.?\x20?(\d+(\.\d+)?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    let category = 'Uncategorized';
    if (amount > 0) {
      const aiResult = await aiService.categorizeExpense(smsText);
      category = aiResult.category;
    }

    if (amount > 0) {
      if (!isMongoConnected()) {
         const mockTx = {
            _id: Math.random().toString(36).substr(2, 9),
            amount,
            category,
            note: `Parsed from SMS`,
            paymentMethod: 'Bank Transfer',
            source: 'sms',
            date: new Date()
         };
         memoryDb.push(mockTx);
         return res.status(201).json({ success: true, transaction: mockTx });
      }

      const newTx = new Transaction({
        amount: amount,
        category: category,
        note: `Parsed from SMS`,
        paymentMethod: 'Bank Transfer',
        source: 'sms'
      });
      const savedTx = await newTx.save();
      return res.status(201).json({ success: true, transaction: savedTx });
    }

    res.status(400).json({ error: 'Could not parse amount from SMS' });
  } catch (err) {
    res.status(500).json({ error: 'SMS Parsing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

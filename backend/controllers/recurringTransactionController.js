const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions for the logged-in user
// @route   GET /api/recurring-transactions
// @access  Private
const getRecurringTransactions = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = { user: req.user._id };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const transactions = await RecurringTransaction.find(filter).sort({ nextDueDate: 1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new recurring transaction
// @route   POST /api/recurring-transactions
// @access  Private
const createRecurringTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, frequency, startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date();
    const recurring = await RecurringTransaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      frequency,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextDueDate: start,
    });

    res.status(201).json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// @desc    Update a recurring transaction
// @route   PUT /api/recurring-transactions/:id
// @access  Private
const updateRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json(recurring);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// @desc    Toggle active/inactive status of a recurring transaction
// @route   PATCH /api/recurring-transactions/:id/toggle
// @access  Private
const toggleRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a recurring transaction
// @route   DELETE /api/recurring-transactions/:id
// @access  Private
const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json({ message: 'Recurring transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process due recurring transactions (creates Transaction entries)
// @route   POST /api/recurring-transactions/process
// @access  Private
const processDueTransactions = async (req, res) => {
  try {
    const now = new Date();
    const dueItems = await RecurringTransaction.find({
      user: req.user._id,
      isActive: true,
      nextDueDate: { $lte: now },
    });

    const created = [];
    for (const item of dueItems) {
      // Skip if past endDate
      if (item.endDate && item.endDate < now) {
        item.isActive = false;
        await item.save();
        continue;
      }

      // Create an actual Transaction entry
      const tx = await Transaction.create({
        user: item.user,
        type: item.type,
        category: item.category,
        amount: item.amount,
        description: item.description || item.category,
        date: item.nextDueDate,
      });
      created.push(tx);

      // Advance nextDueDate
      item.lastProcessedDate = item.nextDueDate;
      item.nextDueDate = RecurringTransaction.advanceDate(item.nextDueDate, item.frequency);
      await item.save();
    }

    res.json({ processed: created.length, transactions: created });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  toggleRecurringTransaction,
  deleteRecurringTransaction,
  processDueTransactions,
};

const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Name and target amount are required' });
    }
    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount,
      deadline: deadline || null,
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.body.savedAmount !== undefined && req.body.savedAmount >= goal.targetAmount) {
      req.body.isCompleted = true;
    }
    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };

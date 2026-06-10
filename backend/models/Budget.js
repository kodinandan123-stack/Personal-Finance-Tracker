const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Food', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Other'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Budget limit cannot be negative'],
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

// Virtual field: remaining budget
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.limit - this.spent);
});

// Virtual field: percentage used
budgetSchema.virtual('percentUsed').get(function () {
  if (this.limit === 0) return 0;
  return Math.min(100, Math.round((this.spent / this.limit) * 100));
});

// Instance method: check if budget is exceeded
budgetSchema.methods.isExceeded = function () {
  return this.spent > this.limit;
};

// Static method: get all budgets for a user in a given month
budgetSchema.statics.findByUserAndMonth = function (userId, month) {
  return this.find({ user: userId, month }).sort({ category: 1 });
};

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;

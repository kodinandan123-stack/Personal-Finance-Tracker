const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
        },
        name: {
                type: String,
                required: [true, 'Investment name is required'],
                trim: true,
        },
        type: {
                type: String,
                enum: ['stock', 'etf', 'mutual_fund', 'crypto', 'bond', 'real_estate', 'other'],
                required: [true, 'Investment type is required'],
        },
        ticker: {
                type: String,
                trim: true,
                uppercase: true,
          default: null,
        },
        shares: {
                type: Number,
                min: 0,
          default: null,
        },
        purchasePrice: {
                type: Number,
                required: [true, 'Purchase price is required'],
                min: 0,
        },
        currentPrice: {
                type: Number,
                min: 0,
          default: null,
        },
        purchaseDate: {
                type: Date,
          default: Date.now,
        },
        notes: {
                type: String,
                trim: true,
          default: '',
        },
  },
  { timestamps: true }
  );

// Virtual: total cost basis
investmentSchema.virtual('costBasis').get(function () {
    const qty = this.shares || 1;
    return parseFloat((this.purchasePrice * qty).toFixed(2));
});

// Virtual: current market value
investmentSchema.virtual('marketValue').get(function () {
    const qty = this.shares || 1;
    const price = this.currentPrice || this.purchasePrice;
    return parseFloat((price * qty).toFixed(2));
});

// Virtual: unrealised gain / loss
investmentSchema.virtual('gainLoss').get(function () {
    return parseFloat((this.marketValue - this.costBasis).toFixed(2));
});

module.exports = mongoose.model('Investment', investmentSchema);

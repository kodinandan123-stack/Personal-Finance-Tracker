const mongoose = require('mongoose');
const Investment = require('../models/Investment');

describe('Investment model', () => {
  describe('costBasis', () => {
    test('multiplies purchase price by shares', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', shares: 10, purchasePrice: 150 });
      expect(investment.costBasis).toBe(1500);
    });

    test('defaults to a quantity of 1 when shares is not set', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Rental Property', type: 'real_estate', purchasePrice: 250000 });
      expect(investment.costBasis).toBe(250000);
    });

    test('rounds to two decimal places', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Fund', type: 'mutual_fund', shares: 2, purchasePrice: 10.005 });
      expect(investment.costBasis).toBe(20.01);
    });
  });

  describe('marketValue', () => {
    test('uses currentPrice when available', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', shares: 10, purchasePrice: 150, currentPrice: 180 });
      expect(investment.marketValue).toBe(1800);
    });

    test('falls back to purchasePrice when currentPrice is not set', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', shares: 10, purchasePrice: 150 });
      expect(investment.marketValue).toBe(1500);
    });
  });

  describe('gainLoss', () => {
    test('returns a positive value when the market value exceeds the cost basis', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', shares: 10, purchasePrice: 100, currentPrice: 120 });
      expect(investment.gainLoss).toBe(200);
    });

    test('returns a negative value when the market value is below the cost basis', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', shares: 10, purchasePrice: 120, currentPrice: 100 });
      expect(investment.gainLoss).toBe(-200);
    });
  });

  describe('schema behaviour', () => {
    test('uppercases the ticker symbol', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', ticker: 'aapl', purchasePrice: 150 });
      expect(investment.ticker).toBe('AAPL');
    });

    test('requires name, type, and purchasePrice', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId() });
      const error = investment.validateSync();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.type).toBeDefined();
      expect(error.errors.purchasePrice).toBeDefined();
    });

    test('rejects a type outside the allowed enum values', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'nft', purchasePrice: 150 });
      const error = investment.validateSync();
      expect(error.errors.type).toBeDefined();
    });

    test('passes validation with valid fields', () => {
      const investment = new Investment({ user: new mongoose.Types.ObjectId(), name: 'Apple', type: 'stock', ticker: 'AAPL', shares: 5, purchasePrice: 150 });
      const error = investment.validateSync();
      expect(error).toBeUndefined();
    });
  });
});

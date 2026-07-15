const {
    estimateUSFederalIncomeTax,
    estimateUSCapitalGainsTax,
    calculateSelfEmploymentTax,
    estimateQuarterlyTaxPayments,
    calculateProgressiveTax,
} = require('../utils/taxCalculator');

describe('taxCalculator', () => {
    test('calculateProgressiveTax applies rates across brackets', () => {
          const brackets = [
            { min: 0, max: 100, rate: 0.1 },
            { min: 100, max: Infinity, rate: 0.2 },
                ];
          const result = calculateProgressiveTax(150, brackets);
          expect(result.tax).toBeCloseTo(20, 2);
    });

           test('calculateProgressiveTax returns zero tax for zero income', () => {
                 const brackets = [{ min: 0, max: Infinity, rate: 0.1 }];
                 const result = calculateProgressiveTax(0, brackets);
                 expect(result.tax).toBe(0);
                 expect(result.effectiveRate).toBe(0);
           });

           test('estimateUSFederalIncomeTax applies the standard deduction by default', () => {
                 const result = estimateUSFederalIncomeTax(30000);
                 expect(result.taxableIncome).toBe(30000 - 14600);
                 expect(result.tax).toBeGreaterThan(0);
           });

           test('estimateUSFederalIncomeTax returns 0 tax for income below the deduction', () => {
                 const result = estimateUSFederalIncomeTax(10000);
                 expect(result.taxableIncome).toBe(0);
                 expect(result.tax).toBe(0);
           });

           test('estimateUSCapitalGainsTax applies 0% rate within the first bracket', () => {
                 const result = estimateUSCapitalGainsTax(10000, 0);
                 expect(result.tax).toBe(0);
           });

           test('estimateUSCapitalGainsTax applies 15% rate for mid-range gains', () => {
                 const result = estimateUSCapitalGainsTax(10000, 60000);
                 expect(result.rate).toBe(15);
                 expect(result.tax).toBeCloseTo(1500);
           });

           test('calculateSelfEmploymentTax applies combined social security and medicare rates', () => {
                 const result = calculateSelfEmploymentTax(50000);
                 expect(result.tax).toBeGreaterThan(0);
                 expect(result.deductibleHalf).toBeCloseTo(result.tax / 2, 2);
           });

           test('estimateQuarterlyTaxPayments splits the annual tax into 4 payments', () => {
                 const result = estimateQuarterlyTaxPayments(80000);
                 expect(result.quarterlyPayment).toBeCloseTo(result.annualTax / 4, 2);
           });
});

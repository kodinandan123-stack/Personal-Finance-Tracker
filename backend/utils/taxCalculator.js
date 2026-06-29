/**
 * taxCalculator.js
 * Utility functions for estimating income tax and capital gains tax.
 * Note: These are simplified estimates for informational purposes only.
 * Always consult a tax professional for accurate tax advice.
 */

// US Federal Income Tax Brackets (2024, Single filer)
const US_FEDERAL_BRACKETS_SINGLE_2024 = [
  { min: 0,       max: 11600,    rate: 0.10 },
  { min: 11600,   max: 47150,    rate: 0.12 },
  { min: 47150,   max: 100525,   rate: 0.22 },
  { min: 100525,  max: 191950,   rate: 0.24 },
  { min: 191950,  max: 243725,   rate: 0.32 },
  { min: 243725,  max: 609350,   rate: 0.35 },
  { min: 609350,  max: Infinity, rate: 0.37 },
];

// US Long-Term Capital Gains Tax Rates (2024, Single filer)
const US_CAPITAL_GAINS_BRACKETS_SINGLE_2024 = [
  { min: 0,       max: 47025,    rate: 0.00 },
  { min: 47025,   max: 518900,   rate: 0.15 },
  { min: 518900,  max: Infinity, rate: 0.20 },
];

/**
 * Calculate progressive tax using a bracket system.
 * @param {number} income - Taxable income
 * @param {Array} brackets - Array of { min, max, rate } bracket objects
 * @returns {Object} - { tax, effectiveRate, breakdown }
 */
const calculateProgressiveTax = (income, brackets) => {
  let tax = 0;
  const breakdown = [];

  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;
    tax += taxInBracket;
    breakdown.push({
      bracket: String(bracket.rate * 100) + '%',
      taxableAmount: taxableInBracket,
      taxAmount: taxInBracket,
    });
    if (income <= bracket.max) break;
  }

  const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
  return { tax, effectiveRate: parseFloat(effectiveRate.toFixed(2)), breakdown };
};

/**
 * Estimate US federal income tax for a given annual income (single filer, 2024).
 * @param {number} grossIncome - Annual gross income in USD
 * @param {number} [deductions=14600] - Deductions (standard deduction for single filer 2024)
 * @returns {Object} - { grossIncome, taxableIncome, tax, effectiveRate, marginalRate, breakdown }
 */
const estimateUSFederalIncomeTax = (grossIncome, deductions = 14600) => {
  const taxableIncome = Math.max(0, grossIncome - deductions);
  const { tax, effectiveRate, breakdown } = calculateProgressiveTax(
    taxableIncome,
    US_FEDERAL_BRACKETS_SINGLE_2024
  );

  const marginalBracket = US_FEDERAL_BRACKETS_SINGLE_2024.find(
    (b) => taxableIncome > b.min && taxableIncome <= b.max
  );
  const marginalRate = marginalBracket ? marginalBracket.rate * 100 : 37;

  return {
    grossIncome,
    deductions,
    taxableIncome,
    tax: parseFloat(tax.toFixed(2)),
    effectiveRate,
    marginalRate,
    breakdown,
  };
};

/**
 * Estimate US long-term capital gains tax (single filer, 2024).
 * @param {number} capitalGains - Long-term capital gains amount
 * @param {number} ordinaryIncome - Ordinary income (affects which bracket applies)
 * @returns {Object} - { capitalGains, tax, rate }
 */
const estimateUSCapitalGainsTax = (capitalGains, ordinaryIncome = 0) => {
  const totalIncome = capitalGains + ordinaryIncome;
  const brackets = US_CAPITAL_GAINS_BRACKETS_SINGLE_2024;
  const bracket =
    brackets.find((b) => totalIncome > b.min && totalIncome <= b.max) ||
    brackets[brackets.length - 1];

  const tax = capitalGains * bracket.rate;
  return {
    capitalGains,
    ordinaryIncome,
    totalIncome,
    tax: parseFloat(tax.toFixed(2)),
    rate: bracket.rate * 100,
  };
};

/**
 * Calculate self-employment tax (US, 2024).
 * Self-employment tax is 15.3% on net earnings up to 168600, then 2.9% above.
 * @param {number} netEarnings - Net self-employment earnings
 * @returns {Object} - { netEarnings, adjustedEarnings, tax, effectiveRate }
 */
const calculateSelfEmploymentTax = (netEarnings) => {
  const adjustedEarnings = netEarnings * 0.9235;
  const socialSecurityWageBase = 168600;
  const socialSecurityTax = Math.min(adjustedEarnings, socialSecurityWageBase) * 0.124;
  const medicareTax = adjustedEarnings * 0.029;
  const tax = socialSecurityTax + medicareTax;
  const effectiveRate = netEarnings > 0 ? (tax / netEarnings) * 100 : 0;

  return {
    netEarnings,
    adjustedEarnings: parseFloat(adjustedEarnings.toFixed(2)),
    socialSecurityTax: parseFloat(socialSecurityTax.toFixed(2)),
    medicareTax: parseFloat(medicareTax.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    effectiveRate: parseFloat(effectiveRate.toFixed(2)),
    deductibleHalf: parseFloat((tax / 2).toFixed(2)),
  };
};

/**
 * Estimate quarterly estimated tax payments.
 * @param {number} annualIncome - Expected annual income
 * @param {number} [deductions=14600] - Expected deductions
 * @returns {Object} - { annualTax, quarterlyPayment }
 */
const estimateQuarterlyTaxPayments = (annualIncome, deductions = 14600) => {
  const { tax: incomeTax } = estimateUSFederalIncomeTax(annualIncome, deductions);
  const selfEmployed = calculateSelfEmploymentTax(annualIncome);
  const annualTax = incomeTax + selfEmployed.tax;
  return {
    annualTax: parseFloat(annualTax.toFixed(2)),
    quarterlyPayment: parseFloat((annualTax / 4).toFixed(2)),
    incomeTax: parseFloat(incomeTax.toFixed(2)),
    selfEmploymentTax: selfEmployed.tax,
  };
};

module.exports = {
  estimateUSFederalIncomeTax,
  estimateUSCapitalGainsTax,
  calculateSelfEmploymentTax,
  estimateQuarterlyTaxPayments,
  calculateProgressiveTax,
};

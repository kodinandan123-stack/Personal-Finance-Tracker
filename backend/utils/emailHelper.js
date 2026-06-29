const nodemailer = require('nodemailer');

/**
 * Creates a reusable transporter for sending emails via SMTP.
 * Configure via environment variables.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a generic email.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<Object>} - nodemailer send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Personal Finance Tracker" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send a budget alert email when spending exceeds a threshold.
 * @param {string} to - Recipient email
 * @param {Object} budget - Budget object with name, spent, limit, currency fields
 */
const sendBudgetAlertEmail = async (to, budget) => {
  const percentage = Math.round((budget.spent / budget.limit) * 100);
  const subject = `Budget Alert: ${budget.name} at ${percentage}%`;
  const html = `
    <h2>Budget Alert</h2>
    <p>Your <strong>${budget.name}</strong> budget has reached <strong>${percentage}%</strong> of its limit.</p>
    <ul>
      <li>Spent: ${budget.currency || '$'}${budget.spent.toFixed(2)}</li>
      <li>Limit: ${budget.currency || '$'}${budget.limit.toFixed(2)}</li>
      <li>Remaining: ${budget.currency || '$'}${(budget.limit - budget.spent).toFixed(2)}</li>
    </ul>
    <p>Consider reviewing your spending to stay within budget.</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send a goal milestone email when a savings goal reaches a milestone.
 * @param {string} to - Recipient email
 * @param {Object} goal - Goal object with name, currentAmount, targetAmount, currency fields
 */
const sendGoalMilestoneEmail = async (to, goal) => {
  const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
  const subject = `Goal Milestone: ${goal.name} at ${percentage}%`;
  const html = `
    <h2>Savings Goal Milestone!</h2>
    <p>Great progress on your <strong>${goal.name}</strong> goal!</p>
    <ul>
      <li>Saved: ${goal.currency || '$'}${goal.currentAmount.toFixed(2)}</li>
      <li>Target: ${goal.currency || '$'}${goal.targetAmount.toFixed(2)}</li>
      <li>Progress: ${percentage}%</li>
    </ul>
    <p>Keep up the great work!</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send a welcome email to a newly registered user.
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Personal Finance Tracker!';
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Thank you for joining Personal Finance Tracker. Here's what you can do:</p>
    <ul>
      <li>Track your income and expenses</li>
      <li>Set and monitor budgets</li>
      <li>Plan your savings goals</li>
      <li>View analytics and reports</li>
    </ul>
    <p>Start by adding your first transaction today!</p>
  `;
  return sendEmail({ to, subject, html });
};

/**
 * Send a monthly summary email with spending and income overview.
 * @param {string} to - Recipient email
 * @param {Object} summary - Summary object with month, income, expenses, savings, topCategories
 */
const sendMonthlySummaryEmail = async (to, summary) => {
  const { month, income, expenses, savings, topCategories = [] } = summary;
  const subject = `Your Monthly Summary for ${month}`;
  const categoryRows = topCategories
    .map(
      (cat) =>
        `<tr><td>${cat.name}</td><td>${cat.currency || '$'}${cat.amount.toFixed(2)}</td></tr>`
    )
    .join('');
  const html = `
    <h2>Monthly Financial Summary — ${month}</h2>
    <table border="1" cellpadding="8" style="border-collapse:collapse;">
      <tr><th>Metric</th><th>Amount</th></tr>
      <tr><td>Total Income</td><td>${summary.currency || '$'}${income.toFixed(2)}</td></tr>
      <tr><td>Total Expenses</td><td>${summary.currency || '$'}${expenses.toFixed(2)}</td></tr>
      <tr><td>Net Savings</td><td>${summary.currency || '$'}${savings.toFixed(2)}</td></tr>
    </table>
    ${
      topCategories.length
        ? `<h3>Top Spending Categories</h3>
           <table border="1" cellpadding="8" style="border-collapse:collapse;">
             <tr><th>Category</th><th>Amount</th></tr>
             ${categoryRows}
           </table>`
        : ''
    }
  `;
  return sendEmail({ to, subject, html });
};

module.exports = {
  sendEmail,
  sendBudgetAlertEmail,
  sendGoalMilestoneEmail,
  sendWelcomeEmail,
  sendMonthlySummaryEmail,
};

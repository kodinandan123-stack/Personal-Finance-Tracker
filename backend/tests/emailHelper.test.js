jest.mock('nodemailer');

const nodemailer = require('nodemailer');
const {
  sendEmail,
  sendBudgetAlertEmail,
  sendGoalMilestoneEmail,
  sendWelcomeEmail,
  sendMonthlySummaryEmail,
} = require('../utils/emailHelper');

describe('emailHelper', () => {
  let sendMailMock;

         beforeEach(() => {
           sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
           nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
         });

         afterEach(() => {
           jest.clearAllMocks();
         });

         describe('sendEmail', () => {
           test('sends an email with the provided options', async () => {
             await sendEmail({ to: 'user@example.com', subject: 'Hi', html: '<p>Hello</p>' });

                expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
             expect(sendMailMock).toHaveBeenCalledTimes(1);
             const mailOptions = sendMailMock.mock.calls[0][0];
             expect(mailOptions.to).toBe('user@example.com');
             expect(mailOptions.subject).toBe('Hi');
             expect(mailOptions.html).toBe('<p>Hello</p>');
           });

                  test('strips HTML tags to build a plain text fallback when text is not provided', async () => {
                    await sendEmail({ to: 'user@example.com', subject: 'Hi', html: '<p>Hello <b>World</b></p>' });

                       const mailOptions = sendMailMock.mock.calls[0][0];
                    expect(mailOptions.text).toBe('Hello World');
                  });

                  test('uses the provided plain text over the generated fallback', async () => {
                    await sendEmail({ to: 'user@example.com', subject: 'Hi', html: '<p>Hello</p>', text: 'Custom text' });

                       const mailOptions = sendMailMock.mock.calls[0][0];
                    expect(mailOptions.text).toBe('Custom text');
                  });
         });

         describe('sendBudgetAlertEmail', () => {
           test('includes budget name and percentage in the subject', async () => {
             const budget = { name: 'Groceries', spent: 80, limit: 100, currency: '$' };
             await sendBudgetAlertEmail('user@example.com', budget);

                const mailOptions = sendMailMock.mock.calls[0][0];
             expect(mailOptions.subject).toBe('Budget Alert: Groceries at 80%');
             expect(mailOptions.html).toContain('Groceries');
             expect(mailOptions.html).toContain('80%');
           });

                  test('calculates remaining budget correctly in the email body', async () => {
                    const budget = { name: 'Travel', spent: 250, limit: 300, currency: '$' };
                    await sendBudgetAlertEmail('user@example.com', budget);

                       const mailOptions = sendMailMock.mock.calls[0][0];
                    expect(mailOptions.html).toContain('$50.00');
                  });
         });

         describe('sendGoalMilestoneEmail', () => {
           test('includes goal name and progress percentage in the subject', async () => {
             const goal = { name: 'Emergency Fund', currentAmount: 500, targetAmount: 1000, currency: '$' };
             await sendGoalMilestoneEmail('user@example.com', goal);

                const mailOptions = sendMailMock.mock.calls[0][0];
             expect(mailOptions.subject).toBe('Goal Milestone: Emergency Fund at 50%');
             expect(mailOptions.html).toContain('50%');
           });
         });

         describe('sendWelcomeEmail', () => {
           test('greets the user by name', async () => {
             await sendWelcomeEmail('user@example.com', 'Alex');

                const mailOptions = sendMailMock.mock.calls[0][0];
             expect(mailOptions.subject).toBe('Welcome to Personal Finance Tracker!');
             expect(mailOptions.html).toContain('Welcome, Alex!');
           });
         });

         describe('sendMonthlySummaryEmail', () => {
           test('includes income, expenses, and savings in the summary table', async () => {
             const summary = {
               month: 'June 2026',
               income: 3000,
               expenses: 2000,
               savings: 1000,
               currency: '$',
             };
             await sendMonthlySummaryEmail('user@example.com', summary);

                const mailOptions = sendMailMock.mock.calls[0][0];
             expect(mailOptions.subject).toBe('Your Monthly Summary for June 2026');
             expect(mailOptions.html).toContain('$3000.00');
             expect(mailOptions.html).toContain('$2000.00');
             expect(mailOptions.html).toContain('$1000.00');
           });

                  test('omits the top categories table when none are provided', async () => {
                    const summary = { month: 'July 2026', income: 100, expenses: 50, savings: 50 };
                    await sendMonthlySummaryEmail('user@example.com', summary);

                       const mailOptions = sendMailMock.mock.calls[0][0];
                    expect(mailOptions.html).not.toContain('Top Spending Categories');
                  });

                  test('renders a row for each top spending category', async () => {
                    const summary = {
                      month: 'July 2026',
                      income: 100,
                      expenses: 50,
                      savings: 50,
                      topCategories: [{ name: 'Rent', amount: 30 }, { name: 'Food', amount: 20 }],
                    };
                    await sendMonthlySummaryEmail('user@example.com', summary);

                       const mailOptions = sendMailMock.mock.calls[0][0];
                    expect(mailOptions.html).toContain('Top Spending Categories');
                    expect(mailOptions.html).toContain('Rent');
                    expect(mailOptions.html).toContain('Food');
                  });
         });
});

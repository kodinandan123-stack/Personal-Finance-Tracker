const {
    calculateProgress,
    estimateCompletionDate,
    requiredMonthlyContribution,
    getGoalStatus,
    buildGoalSummary,
} = require('../utils/savingsGoalHelper');

describe('savingsGoalHelper', () => {
    test('calculateProgress returns percentage toward target', () => {
          expect(calculateProgress(250, 1000)).toBe(25);
          expect(calculateProgress(1000, 1000)).toBe(100);
    });

           test('calculateProgress caps at 100 when current exceeds target', () => {
                 expect(calculateProgress(1500, 1000)).toBe(100);
           });

           test('calculateProgress returns 0 for an invalid target', () => {
                 expect(calculateProgress(100, 0)).toBe(0);
                 expect(calculateProgress(100, null)).toBe(0);
           });

           test('estimateCompletionDate returns null when goal is already met', () => {
                 expect(estimateCompletionDate(1000, 1000, 100)).toBeNull();
           });

           test('estimateCompletionDate returns null for an invalid contribution', () => {
                 expect(estimateCompletionDate(0, 1000, 0)).toBeNull();
           });

           test('estimateCompletionDate projects a future date based on contribution', () => {
                 const now = new Date();
                 const result = estimateCompletionDate(0, 500, 100);
                 const monthsDiff =
                         (result.getFullYear() - now.getFullYear()) * 12 + (result.getMonth() - now.getMonth());
                 expect(monthsDiff).toBe(5);
           });

           test('requiredMonthlyContribution returns null when deadline has passed', () => {
                 expect(requiredMonthlyContribution(0, 1000, '2000-01-01')).toBeNull();
           });

           test('requiredMonthlyContribution returns 0 when goal already met', () => {
                 const future = new Date();
                 future.setFullYear(future.getFullYear() + 1);
                 expect(requiredMonthlyContribution(1000, 1000, future.toISOString())).toBe(0);
           });

           test('requiredMonthlyContribution calculates the amount needed per month', () => {
                 const deadline = new Date();
                 deadline.setMonth(deadline.getMonth() + 10);
                 const result = requiredMonthlyContribution(0, 1000, deadline.toISOString());
                 expect(result).toBeGreaterThan(0);
           });

           test('getGoalStatus returns completed when target is reached', () => {
                 expect(getGoalStatus(1000, 1000, '2026-01-01', '2026-12-31')).toBe('completed');
           });

           test('getGoalStatus returns not_started before the start date', () => {
                 const future = new Date();
                 future.setFullYear(future.getFullYear() + 1);
                 const later = new Date();
                 later.setFullYear(later.getFullYear() + 2);
                 expect(getGoalStatus(0, 1000, future.toISOString(), later.toISOString())).toBe('not_started');
           });

           test('buildGoalSummary returns a summary object with progress and status', () => {
                 const goal = {
                         currentAmount: 200,
                         targetAmount: 1000,
                         startDate: '2026-01-01',
                         deadline: '2026-12-31',
                         monthlyContribution: 100,
                 };
                 const summary = buildGoalSummary(goal);
                 expect(summary.progress).toBe(20);
                 expect(summary.remaining).toBe(800);
                 expect(summary.projectedCompletion).not.toBeNull();
           });
});

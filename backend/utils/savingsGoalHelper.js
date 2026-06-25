/**
 * savingsGoalHelper.js
  * Utility functions for savings goal calculations.
   */

   /**
    * Calculate progress % toward a savings goal (0-100).
     */
     const calculateProgress = (currentAmount, targetAmount) => {
       if (!targetAmount || targetAmount <= 0) return 0;
         return parseFloat(Math.min((currentAmount / targetAmount) * 100, 100).toFixed(1));
         };

         /**
          * Estimate completion date given a monthly contribution.
           * Returns null if goal is met or contribution is invalid.
            */
            const estimateCompletionDate = (currentAmount, targetAmount, monthlyContribution) => {
              if (currentAmount >= targetAmount) return null;
                if (!monthlyContribution || monthlyContribution <= 0) return null;
                  const monthsNeeded = Math.ceil((targetAmount - currentAmount) / monthlyContribution);
                    const date = new Date();
                      date.setMonth(date.getMonth() + monthsNeeded);
                        return date;
                        };

                        /**
                         * Calculate required monthly contribution to hit target by deadline.
                          * Returns null if deadline is in the past.
                           */
                           const requiredMonthlyContribution = (currentAmount, targetAmount, deadline) => {
                             const end = new Date(deadline);
                               const now = new Date();
                                 if (end <= now) return null;
                                   const remaining = Math.max(targetAmount - currentAmount, 0);
                                     if (remaining === 0) return 0;
                                       const months =
                                           (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
                                             if (months <= 0) return null;
                                               return parseFloat((remaining / months).toFixed(2));
                                               };

                                               /**
                                                * Determine if a goal is on_track, behind, ahead, completed, or not_started.
                                                 */
                                                 const getGoalStatus = (currentAmount, targetAmount, startDate, deadline) => {
                                                   if (currentAmount >= targetAmount) return 'completed';
                                                     const start = new Date(startDate);
                                                       const end = new Date(deadline);
                                                         const now = new Date();
                                                           const elapsed = now - start;
                                                             const totalDuration = end - start;
                                                               if (elapsed <= 0) return 'not_started';
                                                                 if (elapsed >= totalDuration) return 'behind';
                                                                   const expectedPct = elapsed / totalDuration;
                                                                     const actualPct = currentAmount / targetAmount;
                                                                       if (actualPct >= expectedPct + 0.05) return 'ahead';
                                                                         if (actualPct < expectedPct - 0.05) return 'behind';
                                                                           return 'on_track';
                                                                           };

                                                                           /**
                                                                            * Build a rich summary object for a savings goal.
                                                                             */
                                                                             const buildGoalSummary = (goal) => {
                                                                               const current = goal.currentAmount || 0;
                                                                                 const progress = calculateProgress(current, goal.targetAmount);
                                                                                   const status = getGoalStatus(
                                                                                       current,
                                                                                           goal.targetAmount,
                                                                                               goal.startDate || goal.createdAt,
                                                                                                   goal.deadline
                                                                                                     );
                                                                                                       return {
                                                                                                           progress,
                                                                                                               status,
                                                                                                                   remaining: parseFloat((goal.targetAmount - current).toFixed(2)),
                                                                                                                       projectedCompletion: goal.monthlyContribution
                                                                                                                             ? estimateCompletionDate(current, goal.targetAmount, goal.monthlyContribution)
                                                                                                                                   : null,
                                                                                                                                       monthlyRequired: goal.deadline
                                                                                                                                             ? requiredMonthlyContribution(current, goal.targetAmount, goal.deadline)
                                                                                                                                                   : null,
                                                                                                                                                     };
                                                                                                                                                     };
                                                                                                                                                     
                                                                                                                                                     module.exports = {
                                                                                                                                                       calculateProgress,
                                                                                                                                                         estimateCompletionDate,
                                                                                                                                                           requiredMonthlyContribution,
                                                                                                                                                             getGoalStatus,
                                                                                                                                                               buildGoalSummary,
                                                                                                                                                               };
                                                                                                                                                               

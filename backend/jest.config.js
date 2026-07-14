/**
 * Jest configuration for the Personal Finance Tracker backend.
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    collectCoverageFrom: ['utils/**/*.js', 'controllers/**/*.js'],
};

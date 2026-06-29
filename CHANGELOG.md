# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dark mode preference persistence in user profile settings.
- Transaction search and filter by date range, category, and amount.

## [2.2.0] - 2026-06-29

### Added
- `recurringTransactionRoutes.js` — REST routes for recurring transactions with full CRUD, plus `pause`, `resume`, and `process-due` endpoints, all protected by authentication middleware.
- `emailHelper.js` — nodemailer-based email utility with `sendBudgetAlertEmail`, `sendGoalMilestoneEmail`, `sendWelcomeEmail`, and `sendMonthlySummaryEmail` helpers.
- `taxCalculator.js` — US tax estimation utilities including `estimateUSFederalIncomeTax`, `estimateUSCapitalGainsTax`, `calculateSelfEmploymentTax`, and `estimateQuarterlyTaxPayments` based on 2024 tax brackets.

## [2.1.0] - 2026-06-28

### Added
- Structured health check endpoint (`GET /api/health`) with MongoDB connection status, server uptime, and ISO timestamp. Returns HTTP 200 when healthy and 503 when degraded.
- `healthController.js` — dedicated controller for the health check response, replacing the previous inline route handler.
- Extended `backend/utils/validators.js` with `isValidObjectId`, `isValidDate`, `isValidFrequency`, and `isWithinLength` helpers.
- Password reset via email flow (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).

### Changed
- `healthRoutes.js` refactored to delegate to `healthController` instead of handling the response inline.
- `server.js` now mounts `healthRoutes` at `/api/health` alongside all other API routes.

## [2.0.0]

### Added
- Budget alerts and notifications.
- Multi-currency support.

## [1.1.0]

### Added
- Savings goals tracker.
- CSV export of transactions.
- Recurring transactions with auto-processing.

## [1.0.0]

### Added
- Income and expense tracking by category.
- JWT-based user authentication.
- Monthly dashboard with income vs. expense charts.

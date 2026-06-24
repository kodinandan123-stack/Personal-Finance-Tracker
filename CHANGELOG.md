# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Health check endpoint (`GET /api/health`) for uptime monitoring.
- Shared backend input validation utilities (`backend/utils/validators.js`).
- `useDebounce` React hook for search and filter inputs.
- Password reset via email flow (POST /api/auth/forgot-password, POST /api/auth/reset-password).
- Dark mode preference persistence in user profile settings.
- Transaction search and filter by date range, category, and amount.

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

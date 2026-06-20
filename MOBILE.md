# Mobile App Plan

The mobile app is the main remaining item for the v2.0 milestone. The existing
Express/MongoDB backend can serve the mobile client as-is; this document tracks
the client-side work required to reach a complete mobile build.

## Status

Not started. There is currently no mobile codebase, branch, or in-progress
pull request.

## Proposed Stack

- React Native (Expo)
- React Navigation
- Reuse of existing REST API (set the API base URL via env config)
- Secure token storage (e.g. expo-secure-store) in place of localStorage

## Foundation

- [ ] Initialize React Native / Expo project
- [ ] Configure navigation
- [ ] Set up API client pointing at the backend (base URL via env)
- [ ] Port JWT auth flow and use secure token storage

## Screens to Build

Each maps to an existing web page under `frontend/src/pages`:

- [ ] Login
- [ ] Register
- [ ] Dashboard (with charts)
- [ ] Transactions
- [ ] Budgets
- [ ] Goals
- [ ] Recurring transactions
- [ ] Reports
- [ ] Profile

## Shared Components & Services

- [ ] Navigation bar / tab navigator
- [ ] Notification banner
- [ ] Currency formatting helper (port of useCurrency)
- [ ] Debounce helper (port of useDebounce)

## Out of Scope (tracked in ROADMAP.md)

- Shared/household accounts
- Bank account sync (Plaid integration)
- Dark mode
- Automated test coverage

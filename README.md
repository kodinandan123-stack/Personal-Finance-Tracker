# 💰 Personal Finance Tracker

A full-stack web app to track income, expenses, budgets, and savings goals with visual charts, recurring transactions, and smart budget alerts.

## Tech Stack
- **Frontend:** React.js (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Charts:** Recharts
- **Auth:** JWT-based authentication

## Features
- Track income and expenses by category
- Visual dashboard with monthly income vs. expense charts
- Budgets with category limits and overspend alerts
- Savings goals tracker with progress
- Recurring transactions (auto-processing of due items)
- Notifications for budget alerts and goal milestones
- Reports with date-range filtering
- Export transactions to CSV
- Multi-currency support
- JWT-based user authentication
- Mobile responsive design

## Project Structure
```
Personal-Finance-Tracker/
├── backend/    # Express API, MongoDB models, controllers, routes
└── frontend/   # React + Vite + Tailwind client
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite's dev server and the backend API on port 5000 by default.

## Environment Variables
See `backend/.env.example` for required variables (MongoDB URI, JWT secret, port).

## Contributing
Contributions are welcome! Please read CONTRIBUTING.md before opening a pull request.

## Project Status
✅ Core features complete — actively maintained.

## License
This project is licensed under the MIT License — see the LICENSE file for details.

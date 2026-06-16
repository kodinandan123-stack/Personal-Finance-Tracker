const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const recurringTransactionRoutes = require('./routes/recurringTransactionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recurring', recurringTransactionRoutes);

// Health check
app.get('/', (req, res) => {
            res.json({ message: 'Personal Finance Tracker API is running' });
});

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
                console.log('MongoDB connected');
                const PORT = process.env.PORT || 5000;
                app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
                console.error('MongoDB connection error:', err.message);
                process.exit(1);
  });

module.exports = app;

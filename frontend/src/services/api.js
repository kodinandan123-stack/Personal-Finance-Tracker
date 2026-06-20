import axios from 'axios'

// Base Axios API instance.
// In dev, requests are proxied to the backend (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed API origin.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')

// Transaction endpoints
export const getTransactions = (params) => API.get('/transactions', { params })
export const addTransaction = (data) => API.post('/transactions', data)
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`)
export const getTransactionSummary = () => API.get('/transactions/summary')
export const exportTransactionsCSV = () => API.get('/transactions/export')

// Budget endpoints
export const getBudgets = (params) => API.get('/budgets', { params })
export const createBudget = (data) => API.post('/budgets', data)
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data)
export const deleteBudget = (id) => API.delete(`/budgets/${id}`)
export const getBudgetSummary = (params) => API.get('/budgets/summary', { params })

// Goal endpoints
export const getGoals = () => API.get('/goals')
export const createGoal = (data) => API.post('/goals', data)
export const updateGoal = (id, data) => API.put(`/goals/${id}`, data)
export const deleteGoal = (id) => API.delete(`/goals/${id}`)

// Dashboard endpoint
export const getDashboard = () => API.get('/dashboard')

// Report endpoints
export const getSpendingByCategory = (params) => API.get('/reports/spending-by-category', { params })
export const getMonthlyTrend = () => API.get('/reports/monthly-trend')

// Notification endpoints
export const getNotifications = () => API.get('/notifications')
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => API.patch('/notifications/read-all')
export const deleteNotification = (id) => API.delete(`/notifications/${id}`)
export const clearReadNotifications = () => API.delete('/notifications/clear-read')

export default API

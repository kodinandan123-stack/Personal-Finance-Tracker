import axios from 'axios'
import Constants from 'expo-constants'
import { getToken } from './auth'

// Base Axios API instance for the mobile client.
// The backend base URL is resolved from Expo config (app.json -> extra.apiBaseUrl)
// and can be overridden per-environment via EXPO_PUBLIC_API_BASE_URL.
const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'http://localhost:5000/api'

const API = axios.create({ baseURL })

// Attach the JWT token (read from secure storage) to every request if present.
API.interceptors.request.use(async (config) => {
  const token = await getToken()
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

// Budget endpoints
export const getBudgets = () => API.get('/budgets')
export const addBudget = (data) => API.post('/budgets', data)

// Goal endpoints
export const getGoals = () => API.get('/goals')
export const addGoal = (data) => API.post('/goals', data)

export default API

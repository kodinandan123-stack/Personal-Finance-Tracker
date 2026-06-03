import axios from 'axios'

// Base Axios API instance - proxied to backend at port 5000 via Vite
const API = axios.create({
  baseURL: '/api',
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

              export default API

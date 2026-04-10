import axios from 'axios'

const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4001'

const authClient = axios.create({
  baseURL: USER_SERVICE_URL,
})

export const authService = {
  register: (email, password, name) =>
    authClient.post('/auth/register', { email, password, name }),
  
  login: (email, password) =>
    authClient.post('/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  refreshToken: () => {
    const token = localStorage.getItem('token')
    return authClient.post('/auth/refresh', { token })
  },
  
  getProfile: (userId) => {
    const token = localStorage.getItem('token')
    return authClient.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  },
}

export default authService

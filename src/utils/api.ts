import axios from 'axios'
import { useUserStore } from '@/store/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  try {
    const user = useUserStore()
    if (user && user.token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${user.token}`
    }
  } catch (e) {
    // ignore in non-setup context
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // global error handling
    return Promise.reject(err)
  }
)

export default api

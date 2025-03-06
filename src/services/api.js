import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/', // Django 后端地址
  timeout: 5000
})

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
}) 

export default api
export const register = (data) => axios.post('/register/', data)
export const login = (data) => axios.post('/login/', data)
<template>
    <div class="auth-container">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" required>
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="text" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required>
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirmPassword" type="password" required>
        </div>
        <button type="submit">注册</button>
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')

const register = async () => {
  try {
    const response = await axios.post('/api/register/', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    console.log('Registration success:', response.data)
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error.response.data)
  }
}
  </script>
  
  <style lang="scss" scoped>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
    }
  
    .form-group {
      margin-bottom: 1rem;
  
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
  
      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }
  
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
  
      &:hover {
        background-color: #3aa876;
      }
    }
  }
  </style>




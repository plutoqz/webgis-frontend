<template>
    <div class="auth-container">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" required>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required>
        </div>
        <button type="submit">登录</button>
        <p>没有账号？<router-link to="/register">立即注册</router-link></p>
      </form>
    </div>
    <div>
      <h1>Login Page</h1>

    </div>
</template>
  
  <script setup>
  import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/login/', {
      username: username.value,
      password: password.value
    })
    console.log('Login success:', response.data)
    router.push('/components/Map')
  } catch (error) {
    console.error('Login failed:', error.response.data)
  }
}
  </script>

  <style lang="scss" scoped>
 
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #285be7;
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
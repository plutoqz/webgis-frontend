import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import api from './services/api'
//app.config.globalProperties.$axios = axios
//createApp(App).mount('#app')
//createApp(App).use(router).mount('#app')
// 在全局配置中添加 axios
createApp(App)
  .use(router)
  .provide('$axios', axios) // 或者使用 config.globalProperties 来挂载
  .mount('#app')
  .config.globalProperties.$axios = axios.create({
    baseURL: '/api/'
})

 
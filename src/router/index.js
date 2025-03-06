import { createRouter, createWebHistory } from 'vue-router'
//import MapView from '@/views/MapView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import Map from '../components/Map.vue'

const routes = [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView
    },
    {
      path: '/components/map',
      name: 'Mappage',
      component: Map,
      meta: { requiresAuth: true }
    }
  ]
  
  const router = createRouter({
    history: createWebHistory(),
    routes
  })
  
  // 路由守卫
  router.beforeEach((to, from, next) => {
    //localStorage.removeItem('isAuthenticated');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    // 如果页面需要认证而用户没有认证，则跳转到登录页
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })
  
  export default router
  
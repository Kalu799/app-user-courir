import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      "name": "Home",
      "path": "/",
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage
    },
    {
      path: '/profil',
      name: 'profil',
      component: ProfilePage
    }
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const publicPages = ['/login', '/register']

  if (!authStore.isAuthenticated && !publicPages.includes(to.path)) { return '/login' }

  if (authStore.isAuthenticated && publicPages.includes(to.path)) { return '/' }
})

export default router

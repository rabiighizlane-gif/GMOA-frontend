import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/Views/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
    },
  ],
})

export default router

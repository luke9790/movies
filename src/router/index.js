import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import { auth } from '@/firebase'
// import { onAuthStateChanged } from 'firebase/auth'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/film/:id',
    name: 'MovieDetail',
    component: () => import('@/views/MovieDetail.vue'),
    props: true
  },
  {
    path: '/dashboard',
    name: 'DashboardPage',
    component: DashboardPage,
    meta: { requiresAuth: true } // Aggiungi un meta campo per indicare che questa pagina richiede l'autenticazione
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && isAuthenticated && to.path === '/login') {
    // Impedisci agli utenti autenticati di visitare la pagina di login
    next('/dashboard')
  } else {
    next()
  }
})

export default router

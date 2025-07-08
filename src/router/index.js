import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE || '/'),
  })

  Router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    // Aguarda a inicialização do auth (se necessário)
    await auth.initAuth()

    const isAuthenticated = auth.isAuthenticated

    if (to.path === '/' && isAuthenticated) {
      next('/chat')
    } else if (to.matched.some((record) => record.meta.login) && !isAuthenticated) {
      next('/')
    } else {
      next()
    }
  })

  return Router
})

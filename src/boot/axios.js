import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAlertStore } from 'stores/alert-store'
import { useAuthStore } from 'stores/auth'
const url = process.env.VITE_API_URL + '/api/v1'
const isDev = process.env.VITE_APP_DEV
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: url,
})
api.interceptors.request.use(
  (config) => {
    // const authStore = useAuthStore();
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status
    const alertStore = useAlertStore()
    const authStore = useAuthStore()

    if (isDev) {
      console.error('Erro na API:', error.message)
    }

    // Notificações de erro
    switch (status) {
      case 401:
        alertStore.addAlert({
          color: 'orange',
          position: 'top-right',
          message: 'Não autenticado, faça login para continuar!',
          icon: 'report_problem',
          timeout: 3000,
          progress: true,
        })
        if (authStore.isAuthenticated) {
          authStore.logout()
        }

        break
      case 403:
        alertStore.addAlert({
          color: 'orange',
          position: 'top-right',
          message: 'Não autorizado, Você não tem permissão para acessar esta rota',
          icon: 'report_problem',
          timeout: 3000,
        })

        break
      case 404:
        alertStore.addAlert({
          color: 'orange',
          position: 'top-right',
          message:
            'A rota que você tentou acessar,não foi encontrada ou não existe. Tente novamente!',
          icon: 'report_problem',
          timeout: 3000,
        })
        break
      case 500:
        alertStore.addAlert({
          color: 'negative',
          position: 'top-right',
          message: 'Erro no servidor, tente novamente mais tarde!',
          icon: 'error',
          timeout: 3000,
        })
        window.location = '/' // Redireciona para a página de NotFound
        break
      default:
        return Promise.reject(error)
    }
    return Promise.reject(error)
  },
)
api.validateToken = async function () {
  return api.get(`${url}users?filtro=usuarioValidar`)
}
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }

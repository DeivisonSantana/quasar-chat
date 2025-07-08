import { defineStore } from 'pinia'
import api from 'src/services/api'

export const useAuthStore = defineStore('user', {
  state: () => ({
    usuario: null,
    loading: false,
    error: null,
    usersOnline: [],
  }),

  getters: {
    isAuthenticated: (state) => !!state.usuario,
    getUsuario: (state) => state.usuario,
    getUsersOnline: (state) => state.usersOnline,

    // Novo getter para verificar se um usuário específico está online
    isUserOnline: (state) => (userId) => {
      return state.usersOnline.some((user) => user.id === userId)
    },
  },

  actions: {
    async logarUsuario(credentials) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('login', {
          email: credentials.email,
          password: credentials.password,
        })

        localStorage.setItem('token', response.data.token)
        await this.getUsuarioAuth()
        if (this.usuario?.id) {
          localStorage.setItem('userId', this.usuario.id)
        }

        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao fazer login'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getUsuarioAuth() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/users?filtro=usuarioAuth`)
        this.usuario = response.data.data.usuario
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao obter dados do usuário'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await api.post('logout', {
        email: this.usuario?.email,
      })
      this.usuario = null

      localStorage.clear()
      this.usersOnline = []
    },

    async validateToken() {
      const response = await api.get('/users?filtro=usuarioValidar')
      return response.data
    },

    async initAuth() {
      const token = localStorage.getItem('token')

      if (token && !this.usuario) {
        try {
          await this.getUsuarioAuth()
        } catch (error) {
          console.error('Error fetching user data during initAuth:', error)
          this.logout()
        }
      }
    },

    setUsersOnline(users) {
      console.log('setando user online')
      if (Array.isArray(users)) {
        this.usersOnline = users
      }
    },

    addUserOnline(user) {
      console.log('add user online')
      if (user && typeof user === 'object' && !Array.isArray(user)) {
        if (!this.usersOnline.some((u) => u.id === user.id)) {
          this.usersOnline.push(user)
        }
      }
    },

    removeUserOnline(user) {
      console.log('remove user online')
      if (user && typeof user === 'object' && !Array.isArray(user)) {
        this.usersOnline = this.usersOnline.filter((u) => u.id !== user.id)
      }
    },
  },
})

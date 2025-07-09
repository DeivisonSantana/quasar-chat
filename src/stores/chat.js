import { defineStore } from 'pinia'
import api from 'src/services/api'

export const useChatStore = defineStore('chat', {
  state: () => ({
    usuariosChat: [],
    conversas: {
      privados: [],
      equipes: [],
      empresas: [],
    },
    chatPrivado: [],
    chatGrupo: [],
    chatEmpresa: [],
    loading: false,
    error: null,
    currentChat: JSON.parse(localStorage.getItem('currentChat')) || null,
    unreadCounts: {}, // 🔔 NOVO
  }),

  getters: {
    getCurrentChat: (state) => state.currentChat,
  },

  actions: {
    setUnreadCount(type, id, count) {
      const key = `${type}-${id}`
      this.unreadCounts[key] = count
    },

    incrementUnread(type, id) {
      const key = `${type}-${id}`
      if (!this.unreadCounts[key]) {
        this.unreadCounts[key] = 0
      }
      this.unreadCounts[key]++
    },

    resetUnread(type, id) {
      const key = `${type}-${id}`
      this.unreadCounts[key] = 0
    },

    getUnreadCount(type, id) {
      const key = `${type}-${id}`
      return this.unreadCounts[key] || 0
    },
    setCurrentChat(chat) {
      this.currentChat = chat
      localStorage.setItem('currentChat', JSON.stringify(chat))
    },
    clearCurrentChat() {
      this.currentChat = null
      localStorage.removeItem('currentChat')
    },

    async getMensagensUser({ id, page, rowsPerPage, lastMessageId }) {
      try {
        const response = await api.get(`chat/user/${id}/mensagens`, {
          params: { page, rowsPerPage, lastMessageId },
        })
        this.chatPrivado = response.data.data
        if (this.chatPrivado.length > 0) {
          const firstMessage = this.chatPrivado[0]
          this.setCurrentChat({
            type: 'user',
            id: id,
            autor: firstMessage.autor, // Dados da empresa
            messages: this.chatPrivado,
          })
        }
        return response.data
      } catch (error) {
        console.error('Error fetching user messages:', error)
        throw error
      }
    },

    async getMensagensEquipe({ page, rowsPerPage, lastMessageId, id }) {
      try {
        const response = await api.get(`chat/equipe/${id}/mensagens`, {
          params: { page, rowsPerPage, lastMessageId },
        })
        this.chatGrupo = response.data.data
        if (this.chatGrupo.length > 0) {
          const firstMessage = this.chatGrupo[0]
          this.setCurrentChat({
            type: 'equipe',
            id: id,
            equipe: firstMessage.equipe, // Dados da empresa
            messages: this.chatGrupo,
          })
        }
        return response.data
      } catch (error) {
        console.error('Error fetching team messages:', error)
        throw error
      }
    },
    async getMensagensEmpresa({ page, rowsPerPage, lastMessageId, id }) {
      try {
        const response = await api.get(`chat/empresa/${id}/mensagens`, {
          params: { page, rowsPerPage, lastMessageId },
        })
        this.chatEmpresa = response.data.data
        if (this.chatEmpresa.length > 0) {
          const firstMessage = this.chatEmpresa[0]
          this.setCurrentChat({
            type: 'empresa',
            id: id,
            empresa: firstMessage.empresa, // Dados da empresa
            messages: this.chatEmpresa,
          })
        }
        return response.data
      } catch (error) {
        console.error('Error fetching team messages:', error)
        throw error
      }
    },

    async getConversas() {
      this.loading = true
      return await api
        .get('chat/conversas')
        .then((response) => {
          this.conversas = response.data.data
        })
        .finally(() => {
          this.loading = false
        })
        .catch((error) => {
          console.error(error?.response || error)
        })
    },

    async getUsuariosChat() {
      return await api
        .get('chat/usuarios')
        .then((response) => {
          this.usuariosChat = response.data.data
          console.log(response, 'chegouaq')
        })
        .catch((error) => {
          console.error(error?.response || error)
        })
    },
  },
})

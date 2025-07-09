<template>
  <q-footer>
    <q-toolbar class="bg-grey-3 text-black row">
      <!-- Botão de emoji (placeholder para futura funcionalidade) -->
      <q-btn round flat icon="insert_emoticon" class="q-mr-sm" />

      <!-- Campo de entrada de mensagem -->
      <q-input
        v-model="localMessage"
        rounded
        outlined
        dense
        class="WAL__field col-grow q-mr-sm"
        bg-color="white"
        placeholder="Type a message"
        :disable="loading"
        @keyup.enter="send"
      />

      <q-btn
        round
        flat
        :icon="localMessage.trim() ? 'send' : 'mic'"
        @click.prevent="send"
        aria-label="Send message"
        :loading="loading"
        :disable="!localMessage.trim() || loading"
      />
    </q-toolbar>
  </q-footer>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useChatStore } from 'src/stores/chat'
import api from 'src/services/api'
import { echo } from 'src/boot/echo'

// Props e emits
const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'send'])
const loading = ref(false)

// Estado local do input
const localMessage = ref(props.modelValue)

// Atualiza o modelValue para o componente pai
watch(localMessage, (val) => {
  emit('update:modelValue', val)
})

// Store
const chat = useChatStore()
const chatSelecionado = computed(() => chat.currentChat)

// Função principal de envio
async function send() {
  const text = localMessage.value.trim()
  if (!text || loading.value) return

  const { chatType, id } = chatSelecionado.value || {}
  if (!chatType || !id) {
    console.warn('Nenhum chat selecionado.')
    return
  }

  const token = window.localStorage.getItem('token')
  const formData = new FormData()
  formData.append('mensagem', text)

  const headers = {
    'Content-Type': 'multipart/form-data',
    'X-Socket-ID': echo.socketId(),
    Authorization: token,
  }

  loading.value = true

  try {
    const endpointMap = {
      privados: `/chat/user/${id}/mensagens`,
      grupos: `/chat/equipe/${id}/mensagens`,
      empresas: `/chat/empresa/${id}/mensagens`,
    }

    const url = endpointMap[chatType]
    if (!url) throw new Error('Tipo de chat inválido.')

    const response = await api.post(url, formData, { headers })
    const novaMensagem = response.data.data

    emit('send', novaMensagem)
    localMessage.value = '' // Limpa o input
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err)
  } finally {
    loading.value = false
  }
}
</script>

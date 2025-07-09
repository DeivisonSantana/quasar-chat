<template>
  <div class="w-full q-pa-md column items-start relative" style="width: 100%; min-width: 240px">
    <q-infinite-scroll
      @load="handleLoad"
      :offset="200"
      reverse
      ref="chatScroll"
      style="width: 100%"
    >
      <q-scroll-observer @scroll="scroller" />

      <div v-if="loading && page >= 1" class="w-full h-full row items-center justify-center">
        <q-spinner color="primary " name="dots" size="24px" />
      </div>

      <ChatMessage :messages="messages" />
    </q-infinite-scroll>
    <q-page-scroller
      reverse
      position="bottom-right"
      :scroll-offset="100"
      :offset="[2, 10]"
      ref="buttonScroller"
      :duration="100"
      v-show="showScrollButton"
      @click="handleScrollToBottom"
    >
      <!-- <q-btn fab icon="keyboard_double_arrow_down" color="primary">
        <ChatCounter :count="newMessagesCount" />
      </q-btn> -->
    </q-page-scroller>
    <ChatMessageInput v-model="message" @send="atualizar" />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from 'src/stores/chat'
import ChatMessage from '../components/chat/ChatMessages.vue'
import ChatMessageInput from '../components/chat/ChatMessageInput.vue'
// import ChatCounter from '../components/chat/ChatCounter.vue'

import { echo } from 'src/boot/echo'

const props = defineProps({ type: String })

const route = useRoute()
const router = useRouter()
const chat = useChatStore()
const message = ref('')
// console.log('ref do scroll', this.$refs.chatScroll)
const messages = ref({ data: [] })
const loading = ref(false)
const page = ref(1)
const rowsPerPage = 20
const hasMore = ref(true)
const initialized = ref(false)
const showScrollButton = ref(false)

const chatScroll = ref(null)
const newMessagesCount = ref(0)

let wsChannel = null

const animateScroll = () => {
  nextTick(() => {
    const scrollArea = chatScroll.value?.$el?.querySelector('.q-scrollarea__container')
    if (scrollArea) {
      scrollArea.style.scrollBehavior = 'smooth'
      scrollArea.scrollTop = 0 // Scroll para o final (modo reverse)
      setTimeout(() => {
        scrollArea.style.scrollBehavior = 'auto'
      }, 300)
    }
  })
}

const isAtBottom = ref(true)

const scroller = ({ position }) => {
  // Em reverse, top = 0 é o fim (parte de baixo)
  isAtBottom.value = position.top <= 20

  // Mostra o botão apenas se não estiver no final E estiver scrollando para baixo
  showScrollButton.value = !isAtBottom.value

  // Quando chega no fim, zeramos o contador
  if (isAtBottom.value) {
    newMessagesCount.value = 0
  }
}

const handleScrollToBottom = () => {
  nextTick(() => {
    const scrollArea = chatScroll.value?.$el?.querySelector('.q-scrollarea__container')
    if (scrollArea) {
      scrollArea.style.scrollBehavior = 'smooth'
      scrollArea.scrollTop = 0
      setTimeout(() => {
        scrollArea.style.scrollBehavior = 'auto'
      }, 300)
    }
    newMessagesCount.value = 0
  })
}

const atualizar = async (novaMensagem) => {
  messages.value.data.push(novaMensagem)

  if (messages.value.data.length > rowsPerPage) {
    messages.value.data.shift()
  }

  if (isAtBottom.value) {
    await nextTick()
    handleScrollToBottom()
  }
}

const fetchMessages = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true

  const id = route.params.id
  const lastMessage = messages.value.data[0]
  const lastMessageId = lastMessage?.id || null

  try {
    let newMessages = []

    switch (props.type) {
      case 'user':
        await chat.getMensagensUser({ id, page: page.value, rowsPerPage, lastMessageId })
        newMessages = chat.chatPrivado.data

        break
      case 'grupo':
        await chat.getMensagensEquipe({ id, page: page.value, rowsPerPage, lastMessageId })
        newMessages = chat.chatGrupo.data
        break
      case 'empresa':
        await chat.getMensagensEmpresa({ id, page: page.value, rowsPerPage, lastMessageId })

        newMessages = chat.chatEmpresa.data
        break
    }

    if (!newMessages.length) {
      hasMore.value = false
      return
    }

    messages.value.data = [
      ...newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      ...messages.value.data,
    ]
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

const handleLoad = async (_index, done) => {
  if (!hasMore.value || loading.value) {
    done()
    return
  }
  await fetchMessages()
  page.value++
  done()
}

const resetChat = async () => {
  loading.value = true
  page.value = 1
  hasMore.value = true
  messages.value = { data: [] }

  try {
    await fetchMessages()
    await nextTick()
    setTimeout(animateScroll, 100) // pequeno delay para garantir que o DOM está pronto
  } finally {
    loading.value = false
  }
}
const userId = localStorage.getItem('userId')

const listenToChatChannel = () => {
  if (!userId) return

  wsChannel = echo.private(`chat.${userId}`)

  console.log('canal conectado', wsChannel)

  // E no listener do WebSocket:
  wsChannel.listen('.mensagem.novo', (data) => {
    console.log('mensagem add', data)
    const novaMensagem = data.mensagem
    const chatIdAtual = route.params.id
    const tipoChat = props.type
    console.log('Tipo chat atual:', props.type)
    console.log('ID chat atual:', route.params.id)
    console.log('Dados nova mensagem:', {
      autor_id: novaMensagem.autor?.id,
      equipe_id: novaMensagem.equipe_id,
      empresa_id: novaMensagem.empresa_id,
    })

    const correspondeAoChatAtual =
      (tipoChat === 'user' && novaMensagem.autor.id == chatIdAtual) ||
      (tipoChat === 'grupo' && novaMensagem.equipe_id == chatIdAtual) ||
      (tipoChat === 'empresa' && novaMensagem.empresa_id == chatIdAtual)

    const chatKeyType = novaMensagem.equipe_id
      ? 'grupos'
      : novaMensagem.empresa_id
        ? 'empresas'
        : 'privados'

    const chatKeyId = novaMensagem.equipe_id || novaMensagem.empresa_id || novaMensagem.autor.id
    console.log('chat key', chatKeyId)
    if (correspondeAoChatAtual) {
      messages.value.data.push(novaMensagem)
    } else {
      chat.incrementUnread(chatKeyType, chatKeyId) // ⬅️ incrementa
      return
    }

    // mensagem do chat atual

    if (messages.value.data.length > rowsPerPage) {
      messages.value.data.shift()
    }

    const isMyMessage = String(novaMensagem.author_id) === String(userId)

    if (isMyMessage) {
      nextTick(() => handleScrollToBottom())
    } else {
      if (!isAtBottom.value) {
        newMessagesCount.value++
      } else {
        nextTick(() => handleScrollToBottom())
      }
    }
  })
}

onMounted(() => {
  if (!userId) {
    return
  }
  if (chat.currentChat && !['chat-user', 'chat-grupo', 'chat-empresa'].includes(route.name)) {
    const routeMap = {
      privados: { name: 'chat-user', params: { id: chat.currentChat.id } },
      equipes: { name: 'chat-grupo', params: { id: chat.currentChat.id } },
      empresas: { name: 'chat-empresa', params: { id: chat.currentChat.id } },
    }

    if (chat.currentChat.chatType && routeMap[chat.currentChat.chatType]) {
      router.push(routeMap[chat.currentChat.chatType])
    }
  }

  if (!initialized.value) {
    initialized.value = true
    resetChat()
  }

  listenToChatChannel()
})

onBeforeUnmount(() => {
  if (wsChannel) {
    wsChannel.stopListening('.mensagem.novo')
    echo.leaveChannel(`chat.${userId}`)
    wsChannel = null
  }
})

watch(
  () => [route.params.id, props.type],
  () => {
    newMessagesCount.value = 0
    showScrollButton.value = false
    resetChat()
  },
  chat.resetUnread(props.type, route.params.id),

  { deep: true, immediate: true },
)
</script>

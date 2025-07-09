<template>
  <div class="WAL position-relative bg-grey-4" :style="style">
    <q-layout view="lHh Lpr lFf" class="WAL__layout shadow-3" container>
      <ChatHeader @toggleLeftDrawer="toggleLeftDrawer" />

      <ChatDrawer
        v-if="!$q.screen.lt.md"
        v-model="leftDrawerOpen"
        :conversations="chat.conversas"
        @update:modelValue="updateDrawerState"
        :search="search"
      />
      <q-page-container>
        <router-view />
      </q-page-container>

      <ChatFooter
        v-if="$q.screen.lt.md && !route.params.id"
        :conversations="chat.conversas"
        v-model="footer.activeTab"
      />
    </q-layout>
  </div>
</template>

<script setup>
import { useQuasar, LocalStorage } from 'quasar'
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useChatStore } from 'src/stores/chat'
import { echo } from 'src/boot/echo'
import ChatHeader from '../components/chat/ChatHeader.vue'
import ChatDrawer from '../components/chat/ChatDrawer.vue'
import ChatFooter from '../components/chat/ChatFooter.vue'
import { useFooterStore } from 'src/stores/footer'
import { useAuthStore } from 'src/stores/auth'
import { useRoute } from 'vue-router'
// import { usePushStore } from 'src/stores/push'

const footer = useFooterStore()
// const pushStore = usePushStore()

const route = useRoute()

const authStore = useAuthStore()
const chat = useChatStore()
const q = useQuasar()

const leftDrawerOpen = ref(false)
function updateDrawerState(newValue) {
  leftDrawerOpen.value = newValue
}
const search = ref('')

const style = computed(() => ({ height: q.screen.height + 'px' }))

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

onBeforeMount(() => {
  //  const wsUser = echo.private(`user.${conversarion.id}`);
  if (!echo.connector.channels['presence-online']) {
    echo
      .join('online')
      .here((users) => {
        authStore.setUsersOnline(users)
      })
      .joining((user) => {
        authStore.addUserOnline(user)
        console.log('user', user)
      })
      .leaving((user) => {
        authStore.removeUserOnline(user)
      })
      .error((error) => {
        console.error('Erro no canal de presença:', error)
      })
  }
})

onMounted(() => {
  const userId = LocalStorage.getItem('userId')
  echo.private(`user.${userId}`)

  echo.private(`chat.${userId}`)
  const wsChat = echo.private(`notificacoes.${userId}`)
  if (!wsChat.subscription.callbacks.get('mensagem.novo')) {
    wsChat.listen('.mensagem.novo', async (e) => {
      if (!e.mensagem && mensagem.autor.id === Number(userId)) return
      const { mensagem } = e
    })
  }

  chat.getConversas()
  // pushStore.initFirebaseMessaging()
})
</script>

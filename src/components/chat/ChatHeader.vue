<template>
  <q-header elevated>
    <q-toolbar class="bg-grey-3 text-black">
      <q-btn
        round
        flat
        icon="keyboard_arrow_left"
        class="WAL__drawer-open q-mr-sm"
        @click="toogleDrawer"
        v-if="!q.screen.lt.md || route.path !== '/chat'"
      />

      <div
        v-if="!selectedConversation && !q.screen.lt.md"
        class="absolute-center"
        style="left: 50%; top: 0; transform: translateX(-50%)"
      >
        <img src="../../assets/logo.png" />
      </div>

      <q-btn round flat v-if="selectedConversation">
        <q-avatar>
          <img
            :src="selectedConversation.thumbnail_host_path"
            :class="
              authStore.isUserOnline(selectedConversation.id) ? 'border-online' : 'border-offline'
            "
          />
        </q-avatar>
      </q-btn>
      <!-- {{ selectedConversation }} -->
      <span v-if="selectedConversation" class="q-subtitle-1 q-pl-md">{{
        selectedConversation.nome || selectedConversation.name || selectedConversation.nome_fantasia
      }}</span>
      <q-space />
      <q-btn v-if="selectedConversation" round flat icon="search" />
      <q-btn v-if="selectedConversation" round flat>
        <q-icon name="attachment" class="rotate-135" />
      </q-btn>
      <q-btn v-if="selectedConversation" round flat icon="more_vert">
        <q-menu auto-close :offset="[110, 0]">
          <q-list style="min-width: 150px">
            <q-item v-for="item in options" :key="item" clickable>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-input
        rounded
        outlined
        dense
        class="WAL__field full-width q-mr-sm"
        bg-color="white"
        v-model="localSearch"
        placeholder="Search conversation"
        v-if="!selectedConversation && q.screen.lt.md"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <div class="q-ml-sm" v-if="!selectedConversation && q.screen.lt.md">
        <q-btn round flat @handle-click="menu = !menu">
          <q-avatar class="cursor-pointer">
            <img :src="authStore.usuario.thumbnail_host_path" />
          </q-avatar>

          <q-menu v-model="menu">
            <q-list dense>
              <q-item clickable v-close-popup>
                <q-item-section>Meu Perfil</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable to="/chat/settings" v-close-popup>
                <q-item-section>Settings</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>
<script setup>
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import { computed, ref, watchEffect } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from 'stores/chat'

const authStore = useAuthStore()
const chat = useChatStore()
const selectedConversation = computed(() => chat.currentChat)
const emit = defineEmits(['toggleLeftDrawer'])
const router = useRouter()
const route = useRoute()
const q = useQuasar()
const menu = ref(false)

const toogleDrawer = () => {
  if (Capacitor.isNativePlatform() || q.screen.lt.md) {
    router.push('/')
  } else {
    emit('toggleLeftDrawer')
  }
}
const localSearch = ref('')
const logout = () => {
  if (localStorage.getItem('tokenFCM')) {
    // pushStore.removeFcmToken()
  }

  authStore.logout().then(() => {
    chat.clearCurrentChat()
    router.push('/')
  })
}
const options = [
  'Contact',
  'Block',
  'Select messages',
  'Silence',
  'Clear messages',
  'Erase messages',
]

// ⚡ Adiciona o watchEffect para controlar o currentChat
watchEffect(() => {
  const { path, params } = route
  let found = null

  if (!chat.conversas) return // ainda carregando

  if (path.startsWith('/chat/user') && params.id) {
    found = chat.conversas.privados?.find((c) => String(c.id) === String(params.id))
    if (found) {
      chat.setCurrentChat({ ...found, chatType: 'privados' })
      return
    }
  }

  if (path.startsWith('/chat/grupo') && params.id) {
    found = chat.conversas.grupos?.find((c) => String(c.id) === String(params.id))
    if (found) {
      chat.setCurrentChat({ ...found, chatType: 'grupos' })
      return
    }
  }

  if (path.startsWith('/chat/empresa') && params.id) {
    found = chat.conversas.empresas?.find((c) => String(c.id) === String(params.id))
    if (found) {
      chat.setCurrentChat({ ...found, chatType: 'empresas' })
      return
    }
  }

  // Se a rota não é válida, limpa
  chat.clearCurrentChat()
})
</script>

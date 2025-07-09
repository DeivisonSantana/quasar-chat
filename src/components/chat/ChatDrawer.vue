<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useChatStore } from 'src/stores/chat'
// import ChatCounter from '../chat/ChatCounter.vue'
// import { usePushStore } from 'src/stores/push'
// const pushStore = usePushStore()
// import ButtonPermission from './utils/ButtonPermission.vue'

const auth = useAuthStore()
const router = useRouter()
const chat = useChatStore()
// const getUnreadCount = (type, id) => chat.getUnreadCount(type, id)
const props = defineProps(['modelValue', 'conversations', 'search'])
const emit = defineEmits(['update:modelValue', 'update:search'])

const localModelValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (newVal) => {
    localModelValue.value = newVal
  },
)

// Enviar atualizações quando o drawer for fechado/aberto internamente
watch(localModelValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const localSearch = ref(props.search)
watch(localSearch, (val) => {
  emit('update:search', val)
})

// Objeto para rastrear mensagens não lidas por conversa
const unreadCounts = ref({})

const menuItems = ['New group', 'Profile', 'Archived', 'Favorites', 'Settings', 'Logout']

function handleMenuItemClick(item) {
  if (item === 'Logout') {
    if (localStorage.getItem('tokenFCM')) {
      // pushStore.removeFcmToken()
    }

    auth.logout().then(() => {
      chat.clearCurrentChat()
      router.push('/')
    })
  } else if (item === 'Settings') {
    router.push('/chat/settings')
  }
}

function getIcon(typeName) {
  const icons = {
    privados: 'chat',
    grupos: 'group',
    empresas: 'business',
  }
  return icons[typeName] || 'perm_identity'
}

function getLabel(typeName, count) {
  const labels = {
    privados: 'Conversas',
    grupos: 'Grupos',
    empresas: 'Empresas',
  }
  const label = labels[typeName] || typeName
  return `${label} (${count})`
}

const selectConversation = (type, index) => {
  const conversation = props.conversations[type][index]
  const routeMap = {
    privados: { name: 'chat-user', params: { id: conversation.id, type: conversation.type } },
    grupos: { name: 'chat-grupo', params: { id: conversation.id, type: conversation.type } },
    empresas: { name: 'chat-empresa', params: { id: conversation.id, type: conversation.type } },
  }

  // Resetar contador de mensagens não lidas ao selecionar a conversa
  const conversationKey = `${type}-${conversation.id}`
  unreadCounts.value[conversationKey] = 0

  chat.setCurrentChat({
    ...conversation,
    chatType: type,
  })
  chat.resetUnread(type, conversation.id)

  router.push(routeMap[type])
}
</script>

<template>
  <q-drawer v-model="localModelValue" show-if-above bordered :breakpoint="690">
    <q-toolbar class="bg-grey-3">
      <q-avatar class="cursor-pointer">
        <img :src="auth.usuario?.thumbnail_host_path" class="" />
      </q-avatar>
      <q-space />
      <q-btn round flat icon="message" />
      <q-btn round flat icon="more_vert">
        <q-menu auto-close :offset="[110, 8]">
          <q-list style="min-width: 150px">
            <q-item
              v-for="item in menuItems"
              :key="item"
              clickable
              @click="handleMenuItemClick(item)"
            >
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <!-- <ButtonPermission /> -->
    </q-toolbar>

    <q-toolbar class="bg-grey-2">
      <q-input
        rounded
        outlined
        dense
        class="WAL__field full-width"
        bg-color="white"
        v-model="localSearch"
        placeholder="Search or start a new conversation"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </q-toolbar>

    <q-scroll-area style="height: calc(100% - 100px)">
      <q-list>
        <q-expansion-item
          default-opened
          v-for="(conversationType, typeName) in conversations"
          :key="typeName"
          :icon="getIcon(typeName)"
          :label="getLabel(typeName, conversationType.length)"
          class="fit q-mt-sm"
        >
          <q-item
            v-for="(item, index) in conversationType"
            :key="index"
            clickable
            v-ripple
            @click="selectConversation(typeName, index)"
            style="max-width: 280px"
          >
            <q-item-section avatar>
              <q-avatar v-if="item.thumbnail_host_path">
                <img
                  :src="item.thumbnail_host_path"
                  :class="auth.isUserOnline(item.id) ? 'border-online' : 'border-offline'"
                />
              </q-avatar>
              <q-avatar v-else>
                <q-icon name="apartment" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{
                item.nome_fantasia || item.name || item.nome
              }}</q-item-label>
            </q-item-section>

            <!-- <q-item-section side top>
              <ChatCounter :count="getUnreadCount(typeName, item.id)" />
            </q-item-section> -->
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<style scoped lang="scss">
.border-online {
  &:not(.q-avatar) {
    border: 3px solid #64b968;
  }

  &.q-avatar {
    .q-avatar__content {
      border: 3px solid #64b968;
    }
  }
}

.border-offline {
  &:not(.q-avatar) {
    border: 3px solid #f35d52;
  }

  &.q-avatar {
    .q-avatar__content {
      border: 3px solid #f35d52;
    }
  }
}

.conversation__summary {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

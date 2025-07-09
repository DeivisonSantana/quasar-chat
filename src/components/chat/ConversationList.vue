<script setup>
import { useChatStore } from 'src/stores/chat'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
const router = useRouter()

const props = defineProps({
  activeType: String,
})

const chat = useChatStore()
const auth = useAuthStore()

// function getIcon(typeName) {
//   const icons = {
//     privados: 'chat',
//     grupos: 'group',
//     empresas: 'business',
//   }
//   return icons[typeName] || 'perm_identity'
// }
function getLabel(item) {
  return item.nome_fantasia || item.name || item.nome || 'Sem nome'
}

function selectConversation(type, index) {
  console.log('qual o type', type)
  console.log('qual o index', index)
  // redireciona para a rota da conversa (exemplo)
  const item = chat.conversas[type][index]

  console.log('items do props')

  const routeMap = {
    privados: { name: 'chat-user', params: { id: item.id, type: item.type } },
    grupos: { name: 'chat-grupo', params: { id: item.id, type: item.type } },
    empresas: { name: 'chat-empresa', params: { id: item.id, type: item.type } },
  }
  chat.setCurrentChat({
    ...item,
    chatType: type,
  })
  router.push(routeMap[type])
}

const currentList = computed(() => chat.conversas[props.activeType] || [])
</script>

<template>
  <q-list>
    <q-item
      v-for="(item, index) in currentList"
      :key="index"
      clickable
      v-ripple
      @click="selectConversation(props.activeType, index)"
      style="max-width: 100%"
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
        <q-item-label lines="1">{{ getLabel(item) }}</q-item-label>
        <q-item-label class="conversation__summary" caption>
          <q-icon name="check" v-if="item.sent" />
          <q-icon name="not_interested" v-if="item.deleted" />
          {{ item.caption || '' }}
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label caption>{{ item.creat || '' }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
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

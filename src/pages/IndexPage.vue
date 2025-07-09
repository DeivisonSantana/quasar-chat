<script setup>
import ChatList from 'src/components/chat/ConversationList.vue'
import { useFooterStore } from 'src/stores/footer'
import { useQuasar } from 'quasar'

const q = useQuasar()

const footer = useFooterStore()
</script>

<template>
  <q-page :class="!q.screen.lt.md ? 'flex flex-center' : 'flex flex-start'">
    <div v-if="!$q.screen.lt.md">
      <div class="column items-center text-grey-6">
        <q-icon name="forum" size="xl" />
        <div class="text-h6 q-mt-md">Selecione uma conversa</div>
        <div class="text-subtitle1">ou inicie uma nova conversa</div>
      </div>
    </div>

    <div v-else>
      <q-page class="column justify-between">
        <div class="q-pa-sm scroll" style="flex: 1; overflow-y: auto">
          <ChatList :activeType="footer.activeTab" />
        </div>
      </q-page>
    </div>
  </q-page>
</template>

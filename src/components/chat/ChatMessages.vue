<template>
  <div style="width: 100%; margin: 0 auto">
    <!-- Grupo por data -->
    <div v-for="(group, date) in groupedMessages" :key="date">
      <div class="text-center text-grey-6 q-mb-md" style="font-size: 0.9rem">
        {{ formatGroupDate(date) }}
      </div>

      <!-- Mensagens do dia -->
      <div
        v-for="msg in group"
        :key="msg.id"
        class="q-mb-sm"
        :class="{ 'row justify-end': isSentMessage(msg) }"
      >
        <div style="max-width: 80%; overflow-wrap: break-word">
          <!-- Cabeçalho com nome e avatar -->
          <div
            class="row items-center q-mb-xs"
            :class="{ 'justify-end': isSentMessage(msg), 'justify-start': !isSentMessage(msg) }"
          >
            <template v-if="!isSentMessage(msg)">
              <q-avatar size="36px" class="q-mx-sm">
                <img v-if="msg.autor?.thumbnail_host_path" :src="msg.autor.thumbnail_host_path" />
                <q-icon v-else name="person" color="grey-6" />
              </q-avatar>
              <span>{{ msg.autor?.name }}</span>
            </template>

            <template v-else>
              <span>{{ msg.autor?.name }}</span>
              <q-avatar size="36px" class="q-mx-sm">
                <img
                  v-if="authStore.usuario?.thumbnail_host_path"
                  :src="authStore.usuario.thumbnail_host_path"
                />
                <q-icon v-else name="person" color="grey-6" />
              </q-avatar>
            </template>
          </div>

          <!-- Corpo da mensagem -->
          <div
            class="relative q-ml-xl q-mr-xl"
            :class="{
              'self-end': isSentMessage(msg), // alinha à direita
              'self-start': !isSentMessage(msg), // alinha à esquerda
            }"
          >
            <q-markdown
              :src="handleMessage(msg)"
              class="q-pa-sm rounded-borders"
              :class="{
                'bg-green-6 text-white': isSentMessage(msg),
                'bg-grey-6': !isSentMessage(msg),
                'sent-bubble': isSentMessage(msg),
                'received-bubble': !isSentMessage(msg),
              }"
            />
          </div>

          <!-- Horário -->
          <div class="row items-center justify-between">
            <div
              class="text-caption text-grey-5 q-mt-xs q-ml-xl q-mr-xl"
              :class="{ 'text-right': isSentMessage(msg), 'text-left': !isSentMessage(msg) }"
            >
              {{ formatTime(msg.created_at) }}
            </div>
            <div
              class="text-caption text-grey-5 q-mt-xs q-ml-xl q-mr-xl"
              :class="{ 'text-right': isSentMessage(msg), 'text-left': !isSentMessage(msg) }"
            >
              <q-icon name="check"></q-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { date } from 'quasar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuthStore } from 'src/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const props = defineProps({
  messages: {
    type: Object,
    required: true,
  },
})

// Agrupa mensagens por data
const groupedMessages = computed(() => {
  const groups = {}
  props.messages.data.forEach((msg) => {
    const msgDate = date.formatDate(msg.created_at, 'DD-MM-YYYY')
    if (!groups[msgDate]) {
      groups[msgDate] = []
    }
    groups[msgDate].push(msg)
  })
  return groups
})

const isSentMessage = (msg) => {
  return msg.autor?.id === authStore.usuario?.id
}

const formatGroupDate = (dateStr) => {
  const today = date.formatDate(Date.now(), 'dd-MM-yyyy')
  const yesterday = date.formatDate(Date.now() - 86400000, 'dd-MM-yyyy')

  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'

  // Converta a string para Date e formate com date-fns
  const [day, month, year] = dateStr.split('-')
  const parsedDate = new Date(`${year}-${month}-${day}`)

  return format(parsedDate, "EEEE, d 'de' MMMM", { locale: ptBR }) // Exemplo: segunda-feira, 9 de junho
}

const formatTime = (val) => {
  return date.formatDate(val, 'h:mm A')
}

function handleMessage(msg) {
  let content = msg.content
  // if (!this.desativarMention)
  content = convertMentions(content, msg.mentions)
  return content
}
function convertMentions(content, mentions) {
  let mensagem = content
  mentions.forEach((m, i) => {
    mensagem = mensagem.replaceAll(
      `@${m.username}`,
      `<span class="mention" mention="${i}">${m.name}</span>`,
    )
  })

  return mensagem
}
</script>
<style scoped lang="scss">
.sent-bubble::after,
.received-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  top: -2px;
}

.sent-bubble::after {
  right: -18px;
  rotate: -16deg;
  width: 20px;
  border-left-color: #4caf50; /* bg-green-6 */
}

.received-bubble::after {
  left: -18px;
  rotate: 15deg;
  width: 20px;
  border-right-color: #9e9e9e; /* bg-grey-6 */
}
:deep(.q-markdown) {
  .mention {
    display: inline-block;
    border: 1px solid #7865a3;
    border-radius: 25px;
    padding: 0.1rem 0.5rem;
    margin: 0 0.2rem;
    cursor: pointer;
  }

  .q-markdown--link {
    border: none;
    .q-item--dark & {
      color: #8080f7;
    }
  }

  .reply & {
    img {
      width: 100px;
    }

    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    p {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .lista-mensagens & {
    img {
      max-width: 500px;
    }
  }
}
</style>

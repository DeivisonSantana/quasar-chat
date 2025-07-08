<template>
  <q-card class="q-ma-md">
    <q-card-section>
      <div class="text-h6">Notificações Recebidas</div>
      <div v-if="notifications.length === 0" class="text-grey">
        Nenhuma notificação recebida ainda.
      </div>
      <q-list bordered v-else>
        <q-item v-for="(notif, index) in notifications" :key="index">
          <q-item-section>
            <q-item-label>{{ notif.title }}</q-item-label>
            <q-item-label caption>{{ notif.body }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PushNotifications } from '@capacitor/push-notifications'

const notifications = ref([])

onMounted(async () => {
  // Solicita permissão
  await PushNotifications.requestPermissions().then((result) => {
    if (result.receive === 'granted') {
      PushNotifications.register()
    }
  })

  // Token gerado com sucesso
  PushNotifications.addListener('registration', (token) => {
    console.log('Token FCM:', token.value)
    // envie para seu backend se necessário
  })

  // Erro ao registrar
  PushNotifications.addListener('registrationError', (err) => {
    console.error('Erro ao registrar push:', err)
  })

  // Notificação recebida em primeiro plano
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notificação recebida em primeiro plano:', notification)
    notifications.value.unshift({
      title: notification.title,
      body: notification.body,
    })
  })

  // Quando o usuário toca em uma notificação
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Usuário tocou na notificação:', notification)
    // Ação personalizada se necessário
  })
})
</script>

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

    <q-separator />

    <q-card-section>
      <div class="q-mb-sm">Deseja receber notificações sobre novas mensagens ou atualizações?</div>

      <q-btn label="Ativar Notificações" color="primary" @click="handleNotificationPermission" />

      <div v-if="statusMessage" class="q-mt-sm text-negative">
        {{ statusMessage }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { messaging } from '../services/firebase-messaging'
import { saveTokenToServer, removeFcmToken } from 'src/utils/fcm'
import { Notify } from 'quasar'

const notifications = ref([])
const statusMessage = ref('')

// Função central para enviar token ao servidor e salvar localmente

async function handleNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    // === PLATAFORMA NATIVA ===
    const permissionStatus = await PushNotifications.requestPermissions()

    if (permissionStatus.receive === 'granted') {
      PushNotifications.register()

      statusMessage.value = 'Permissão ativas'
      PushNotifications.addListener('registration', async (token) => {
        console.log('Token FCM (native):', token.value)
        await saveTokenToServer(token.value)
        localStorage.setItem('tokenFCM', token.value)
      })

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        notifications.value.unshift({
          title: notification.data.title || 'Nova Notificação',
          body: notification.data.body,
        })
        Notify.create({
          ...notifications.value,
          message: notification.data?.title || 'Notificação',
          caption: notification.data?.body || '',
          avatar: notification.data?.image || notification.avatar,
        })
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Usuário tocou na notificação:', notification)
      })
    } else {
      statusMessage.value =
        'Permissão negada. Vá até as configurações do aplicativo para permitir notificações.'
      await removeFcmToken()
    }
  } else {
    // === PLATAFORMA WEB ===
    const permission = Notification.permission

    if (permission === 'granted') {
      const token = await messaging.getToken({
        vapidKey: process.env.VITE_FB_VAPID_KEY,
      })
      console.log('Token FCM (web):', token)
      statusMessage.value = 'Permissão ativas'
      await saveTokenToServer(token)
      localStorage.setItem('tokenFCM', token)

      messaging.onMessage((payload) => {
        const { title, body } = payload.data || {}
        notifications.value.unshift({ title, body })
      })
    } else if (permission === 'default') {
      const result = await Notification.requestPermission()

      if (result === 'granted') {
        const token = await messaging.getToken({
          vapidKey: process.env.VITE_FB_VAPID_KEY,
        })
        console.log('Token FCM (web):', token)

        messaging.onMessage((payload) => {
          const { title, body } = payload.data || {}
          notifications.value.unshift({ title, body })
        })
      } else {
        statusMessage.value =
          'Você recusou as notificações. Para ativar, vá nas configurações do navegador e permita manualmente.'
        await removeFcmToken()
      }
    } else if (permission === 'denied') {
      statusMessage.value =
        'Permissões de notificação estão negadas. Vá até as configurações do navegador para permitir.'
      await removeFcmToken()
    }
  }
}
</script>

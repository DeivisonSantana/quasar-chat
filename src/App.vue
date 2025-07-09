<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
// import { Capacitor } from '@capacitor/core'
// import { PushNotifications } from '@capacitor/push-notifications'
// import { messaging } from 'src/services/firebase-messaging'
// import { getToken } from 'firebase/messaging'
// import { Notify } from 'quasar'
import { checkAndSyncToken, removeFcmToken, initFCMListeners } from 'src/utils/fcm'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const tokenFCM = localStorage.getItem('tokenFCM')

  if (localStorage.getItem('token')) {
    console.log('Token encontrado no localStorage:', localStorage.getItem('token'))
    try {
      await authStore.validateToken()
      await checkAndSyncToken()
    } catch (error) {
      console.log(error)

      if (tokenFCM) {
        await removeFcmToken()
      }

      authStore.logout()
      localStorage.clear()
      router.push('/')
    }
  }

  // Registrar service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration)
      })
      .catch((err) => {
        console.error('Erro ao registrar Service Worker:', err)
      })
  }

  // Iniciar listeners globais
  initFCMListeners()
})
</script>

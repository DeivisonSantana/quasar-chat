import { Capacitor } from '@capacitor/core'
import { getToken } from 'firebase/messaging'
import { messaging } from 'src/services/firebase-messaging'
import { PushNotifications } from '@capacitor/push-notifications'
import { Notify } from 'quasar'

import api from '../services/api'

export async function saveTokenToServer(token) {
  console.log('salvando:', token)
  try {
    await api.post('/users', { filtro: 'setTokenFCM', token })
    localStorage.setItem('tokenFCM', token)
    console.log('token FCM salvo no servidor:', token)
  } catch (error) {
    console.error('Erro ao enviar token ao servidor:', error)
  }
}

export async function removeFcmToken() {
  try {
    const token = localStorage.getItem('tokenFCM')
    const userId = localStorage.getItem('userId')

    if (!Capacitor.isNativePlatform() && messaging) {
      if (token) {
        await messaging.deleteToken(messaging) // deleteToken precisa vir do firebase/messaging
      }
    }

    if (token) {
      try {
        await api.delete(`/delete-token-fcm/${userId}`, { data: { token } })
      } catch (apiError) {
        console.error('Erro ao remover token do servidor:', apiError)
      }
    }

    localStorage.removeItem('tokenFCM')
  } catch (error) {
    console.error('Erro ao remover token FCM:', error)
  }
}

export async function checkNotificationPermission() {
  const existingToken = localStorage.getItem('tokenFCM')

  // 👉 Está rodando no Android ou iOS via Capacitor?
  if (Capacitor.isNativePlatform()) {
    const permissionResult = await PushNotifications.requestPermissions()

    if (permissionResult.receive === 'granted') {
      await PushNotifications.register()

      PushNotifications.addListener('registration', async ({ value }) => {
        if (value && value !== existingToken) {
          await saveTokenToServer(value)
        }
      })

      return 'granted'
    } else {
      console.warn('Permissão de notificação negada no mobile.')
      return 'denied'
    }
  }

  // 👉 Web
  if (typeof Notification === 'undefined') return 'default'

  const permission = Notification.permission

  console.log('Permissão de notificação atual:', permission)

  if (permission === 'granted') {
    if (!existingToken) {
      console.log('sem token FCM existente, solicitando novo token...')
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.VITE_FB_VAPID_KEY,
        })

        if (token) {
          await saveTokenToServer(token)
        }
      } catch (error) {
        console.error('Erro ao obter token FCM na Web:', error)
      }
    }
  }

  return permission
}
export function initFCMListeners() {
  if (Capacitor.isNativePlatform()) {
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificação recebida:', notification)
      Notify.create({
        message: notification.data?.title || 'Notificação',
        caption: notification.data?.body || '',
        avatar: notification.data?.image || notification.avatar,
      })
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Usuário tocou na notificação:', notification)
    })
  } else if (messaging?.onMessage) {
    messaging.onMessage((payload) => {
      console.log('notificação recebida:', payload)
      const { title, body, image } = payload.data || {}

      Notify.create({
        message: title || 'Notificação',
        caption: body || '',
        avatar: image,
        position: 'top-right',
        timeout: 5000,
      })
    })
  }
}
let mobileTokenRegistered = false

export async function checkAndSyncToken() {
  const existingToken = localStorage.getItem('tokenFCM')

  if (Capacitor.isNativePlatform()) {
    const permission = await PushNotifications.requestPermissions()

    if (permission.receive === 'granted') {
      await PushNotifications.register()

      if (!mobileTokenRegistered) {
        PushNotifications.addListener('registration', async ({ value }) => {
          if (value && value !== existingToken) {
            await saveTokenToServer(value)
          }
        })
        mobileTokenRegistered = true
      }
    }
  } else {
    const permission = Notification.permission

    if (permission === 'granted' && !existingToken) {
      console.log('sem token FCM existente, solicitando novo token...')
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.VITE_FB_VAPID_KEY,
        })
        if (token) {
          console.log('Token FCM obtido:', token)
          await saveTokenToServer(token)
        }
      } catch (error) {
        console.error('Erro ao obter token web:', error)
      }
    }
  }
}

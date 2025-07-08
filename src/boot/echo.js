import Echo from 'laravel-echo'
import { LocalStorage } from 'quasar'
// import io from 'socket.io-client'
import Pusher from 'pusher-js'

// window.io = io
window.Pusher = Pusher

// Verifica se há token
const token = LocalStorage.getItem('token')

const echo = new Echo({
  broadcaster: 'pusher',
  cluster: 'mt1',
  key: process.env.VITE_PUSHER_APP_KEY,
  wsHost: process.env.VITE_PUSHER_HOST,
  wssHost: process.env.VITE_PUSHER_HOST,
  wsPort: process.env.VITE_PUSHER_WS_PORT || 6001,
  wssPort: process.env.VITE_PUSHER_WSS_PORT || 6001,
  forceTLS: process.env.VITE_PUSHER_TLS === 'true',
  encrypted: process.env.VITE_PUSHER_ENCRYPTED === 'true',
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: process.env.VITE_PUSHER_AUTH_ENDPOINT,
  auth: {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json',
    },
  },
})

// Desconecta se não tiver token
if (!token) {
  echo.disconnect()
}

// Forma correta em Quasar 2 + Vue 3
export default async ({ app }) => {
  app.config.globalProperties.$echo = echo
}
export { echo }

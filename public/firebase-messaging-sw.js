/* eslint-env serviceworker */
/* global importScripts firebase */
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBNmI96LmAJeBS-cLswbJ5YGfPsd9T7Low',
  authDomain: 'pen6-notification-32857.firebaseapp.com',
  projectId: 'pen6-notification-32857',
  messagingSenderId: '61469000676',
  appId: '1:61469000676:web:4cef01f3e84723c0bcfdf1',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  const transformUrlToResponse = (url) => {
    const baseUrl = 'https://api.pen6.app/api/v1'
    if (url.includes('/chat/usuario/')) {
      return baseUrl + url.replace('/chat/usuario/', '/chat/user/') + '/mensagens'
    } else if (url.includes('/chat/equipe/')) {
      return baseUrl + url + '/mensagens'
    } else if (url.includes('/chat/empresa/')) {
      return baseUrl + url + '/mensagens'
    }
    return baseUrl + url
  }
  const notificationTitle = payload.data.title
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.image || '/icons/icon-128x128.png',
    data: {
      url: payload.data.link || '/',
      urlToResponse: transformUrlToResponse(payload.data.link),
    },
    actions: [
      {
        action: 'reply',
        title: 'Responder',
        type: 'text',
        placeholder: 'Digite sua resposta...',
      },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

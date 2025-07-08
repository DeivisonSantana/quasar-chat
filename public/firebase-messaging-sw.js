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
})

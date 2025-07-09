// compat API para funcionar com service worker
import firebase from 'firebase/compat/app'
import 'firebase/compat/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyBNmI96LmAJeBS-cLswbJ5YGfPsd9T7Low',
  authDomain: 'pen6-notification-32857.firebaseapp.com',
  projectId: 'pen6-notification-32857',
  messagingSenderId: '61469000676',
  appId: '1:61469000676:web:4cef01f3e84723c0bcfdf1',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

export { messaging }

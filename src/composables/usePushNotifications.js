import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'

import firebaseConfig, { firebaseVapidKey } from '@/config/firebase'
import PushNotificationService from '@/services/PushNotificationService'

let messagingInstance = null
let foregroundUnsubscribe = null

const isFirebaseConfigured = () => (
  Boolean(firebaseConfig.apiKey)
  && Boolean(firebaseConfig.projectId)
  && Boolean(firebaseConfig.messagingSenderId)
  && Boolean(firebaseConfig.appId)
  && Boolean(firebaseVapidKey)
)

const PUSH_ENABLED_ROLES = ['ESTUDIANTE', 'SECRETARIA']

const getUserRole = () => {
  const rawUser = localStorage.getItem('user')
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)?.role ?? null
  } catch {
    return null
  }
}

const canRegisterPush = () => PUSH_ENABLED_ROLES.includes(getUserRole())

const registerMessagingServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  const existing = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
  if (existing) {
    return existing
  }

  return navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/',
  })
}

const getMessagingInstance = async () => {
  if (!(await isSupported())) {
    return null
  }

  if (!isFirebaseConfigured()) {
    console.warn('Firebase no está configurado en el frontend.')
    return null
  }

  if (!messagingInstance) {
    const app = initializeApp(firebaseConfig)
    messagingInstance = getMessaging(app)
  }

  return messagingInstance
}

const showForegroundNotification = (payload) => {
  const title = payload?.notification?.title || payload?.data?.title || 'Notificación'
  const body = payload?.notification?.body || payload?.data?.body || ''
  const clickPath = payload?.data?.click_action || '/assistances/alumno/reporte'

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/android-icon-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: clickPath },
    })

    notification.onclick = () => {
      window.focus()
      window.location.href = clickPath
      notification.close()
    }
  }
}

export const registerStudentPushNotifications = async () => {
  if (!canRegisterPush()) {
    return { registered: false, reason: 'role_not_allowed' }
  }

  if (!('Notification' in window)) {
    return { registered: false, reason: 'unsupported' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { registered: false, reason: 'permission_denied' }
  }

  const messaging = await getMessagingInstance()
  if (!messaging) {
    return { registered: false, reason: 'messaging_unavailable' }
  }

  const serviceWorkerRegistration = await registerMessagingServiceWorker()
  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration,
  })

  if (!token) {
    return { registered: false, reason: 'token_unavailable' }
  }

  await PushNotificationService.registerDeviceToken({
    token,
    platform: 'web',
    device_name: navigator.userAgent.slice(0, 120),
  })

  if (!foregroundUnsubscribe) {
    foregroundUnsubscribe = onMessage(messaging, showForegroundNotification)
  }

  return { registered: true, token }
}

export const unregisterStudentPushNotifications = async (token) => {
  if (!token) return

  await PushNotificationService.deactivateDeviceToken(token)

  const messaging = await getMessagingInstance()
  if (messaging) {
    await deleteToken(messaging)
  }
}

export const ensureStudentPushRegistration = async () => {
  try {
    return await registerStudentPushNotifications()
  } catch (error) {
    console.error('No se pudo registrar notificaciones push:', error)
    return { registered: false, reason: 'error' }
  }
}

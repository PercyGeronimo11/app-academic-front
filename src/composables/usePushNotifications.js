import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'
import CryptoJS from 'crypto-js'

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

/** Roles que deben registrar device_token para push del navegador. */
const PUSH_ENABLED_ROLES = ['ESTUDIANTE', 'SECRETARIA']

const getUserRole = (explicitRole = null) => {
  if (explicitRole && typeof explicitRole === 'string') {
    return explicitRole
  }

  try {
    const rawUser = localStorage.getItem('user')
    if (rawUser) {
      const parsed = JSON.parse(rawUser)
      if (parsed?.role && typeof parsed.role === 'string') {
        return parsed.role
      }
    }
  } catch {
    // ignore
  }

  try {
    const roleKey = localStorage.getItem('r_key') || ''
    const secretKey = import.meta.env.VITE_ROLE_KEY?.toString() || ''
    if (roleKey && secretKey) {
      const decrypted = CryptoJS.AES.decrypt(roleKey, secretKey).toString(CryptoJS.enc.Utf8)
      if (decrypted) return decrypted
    }
  } catch {
    // ignore
  }

  return null
}

const canRegisterPush = (explicitRole = null) =>
  PUSH_ENABLED_ROLES.includes(getUserRole(explicitRole))

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
  const clickPath = payload?.data?.click_action
    || (getUserRole() === 'SECRETARIA' ? '/mesa-tramites' : '/myPaperworks')

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

/**
 * Solicita permiso del navegador y registra el token FCM en device_tokens.
 * @param {string|null} explicitRole Rol conocido (p. ej. justo después del login).
 */
export const registerPushNotifications = async (explicitRole = null) => {
  if (!canRegisterPush(explicitRole)) {
    return { registered: false, reason: 'role_not_allowed', role: getUserRole(explicitRole) }
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

  return { registered: true, token, role: getUserRole(explicitRole) }
}

/** @deprecated Usar registerPushNotifications */
export const registerStudentPushNotifications = (explicitRole = null) =>
  registerPushNotifications(explicitRole)

export const unregisterPushNotifications = async (token) => {
  if (!token) return

  await PushNotificationService.deactivateDeviceToken(token)

  const messaging = await getMessagingInstance()
  if (messaging) {
    await deleteToken(messaging)
  }
}

/** @deprecated Usar unregisterPushNotifications */
export const unregisterStudentPushNotifications = unregisterPushNotifications

export const ensurePushRegistration = async (explicitRole = null) => {
  try {
    return await registerPushNotifications(explicitRole)
  } catch (error) {
    console.error('No se pudo registrar notificaciones push:', error)
    return { registered: false, reason: 'error', error }
  }
}

/** @deprecated Usar ensurePushRegistration */
export const ensureStudentPushRegistration = ensurePushRegistration

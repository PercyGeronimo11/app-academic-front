import { ref } from 'vue';
import UserNotificationService from '@/services/UserNotificationService';

const unreadCount = ref(0);
const latestBanner = ref(null);
const lastSeenId = ref(Number(localStorage.getItem('last_notification_id') || 0));
let pollTimer = null;

const requestBrowserPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const showBrowserNotification = (notification) => {
  if (!notification || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const n = new Notification(notification.title, {
    body: notification.body,
    icon: '/favicon.ico',
    tag: `notif-${notification.id}`,
    renotify: true,
  });

  n.onclick = () => {
    window.focus();
    window.location.hash = '';
    window.dispatchEvent(new CustomEvent('open-notifications'));
    n.close();
  };
};

const showInAppBanner = (notification) => {
  latestBanner.value = notification;
  setTimeout(() => {
    if (latestBanner.value?.id === notification.id) {
      latestBanner.value = null;
    }
  }, 5000);
};

const pollNotifications = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const [countRes, latestRes] = await Promise.all([
      UserNotificationService.unreadCount(),
      UserNotificationService.latestUnread(),
    ]);

    unreadCount.value = countRes.data?.data?.count ?? 0;

    const latest = latestRes.data?.data;
    if (latest && latest.id > lastSeenId.value) {
      const isFirstPoll = !sessionStorage.getItem('notifications_poll_init');
      lastSeenId.value = latest.id;
      localStorage.setItem('last_notification_id', String(latest.id));

      if (!isFirstPoll) {
        showInAppBanner(latest);
        showBrowserNotification(latest);
      } else {
        sessionStorage.setItem('notifications_poll_init', '1');
      }
    }
  } catch {
    // silencioso en polling
  }
};

export function useUserNotifications() {
  const startPolling = (intervalMs = 45000) => {
    if (pollTimer) return;
    pollNotifications();
    pollTimer = setInterval(pollNotifications, intervalMs);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const refreshCount = async () => {
    try {
      const res = await UserNotificationService.unreadCount();
      unreadCount.value = res.data?.data?.count ?? 0;
    } catch {
      unreadCount.value = 0;
    }
  };

  const dismissBanner = () => {
    latestBanner.value = null;
  };

  return {
    unreadCount,
    latestBanner,
    refreshCount,
    dismissBanner,
    startPolling,
    stopPolling,
    requestBrowserPermission,
    pollNotifications,
  };
}

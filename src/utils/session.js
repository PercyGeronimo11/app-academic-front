const AUTH_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('tiempoLogin');
  localStorage.removeItem('last_notification_id');
  sessionStorage.removeItem('notifications_poll_init');
}

export function hasValidSession() {
  return !!localStorage.getItem(AUTH_TOKEN_KEY) && !!getStoredUser();
}

const JWT_UNAUTHORIZED_MESSAGES = new Set([
  'Token is Expired',
  'Token is Invalid',
  'Authorization Token not found',
  'Unauthenticated.',
]);

export function isJwtUnauthorized(error) {
  if (error?.response?.status !== 401) {
    return false;
  }

  const message = error.response.data?.message;
  return typeof message === 'string' && JWT_UNAUTHORIZED_MESSAGES.has(message);
}

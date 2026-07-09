import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  list(limit = 30) {
    return axios.get(`${API_URL}/user-notifications`, { params: { limit } });
  },

  unreadCount() {
    return axios.get(`${API_URL}/user-notifications/unread-count`);
  },

  latestUnread() {
    return axios.get(`${API_URL}/user-notifications/latest-unread`);
  },

  markAsRead(id) {
    return axios.patch(`${API_URL}/user-notifications/${id}/read`);
  },

  markAllAsRead() {
    return axios.patch(`${API_URL}/user-notifications/read-all`);
  },
};

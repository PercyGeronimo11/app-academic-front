import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  registerDeviceToken(payload) {
    return axios.post(`${API_URL}/push-notifications/device-tokens`, payload)
      .then((response) => response.data)
  },

  deactivateDeviceToken(token) {
    return axios.delete(`${API_URL}/push-notifications/device-tokens`, {
      data: { token },
    }).then((response) => response.data)
  },

  getScope(params = {}) {
    return axios.get(`${API_URL}/push-notifications/scope`, { params })
      .then((response) => response.data)
  },

  getGradeSections(params = {}) {
    return axios.get(`${API_URL}/push-notifications/grade-sections`, { params })
      .then((response) => response.data)
  },

  getHistory(params = {}) {
    return axios.get(`${API_URL}/push-notifications/history`, { params })
      .then((response) => response.data)
  },

  markAsRead(id) {
    return axios.patch(`${API_URL}/push-notifications/history/${id}/read`)
      .then((response) => response.data)
  },
}

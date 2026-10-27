import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  recordsMeta() {
    return axios.get(`${API_URL}/notes/records/meta`)
  },

  records(params) {
    return axios.get(`${API_URL}/notes/records`, { params })
  },

  reportMeta() {
    return axios.get(`${API_URL}/notes/report/meta`)
  },

  report(params) {
    return axios.get(`${API_URL}/notes/report`, { params })
  },
}

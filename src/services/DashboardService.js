import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  async getHome() {
    return axios.get(`${API_URL}/home`)
  },

  /** @deprecated Prefer getHome() */
  async getItems() {
    return axios.get(`${API_URL}/dashboard`)
  },
}

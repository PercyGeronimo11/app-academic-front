import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  async list(year = null) {
    return axios.get(`${API_URL}/bimester/list`, {
      params: year ? { year } : {},
    })
  },

  async getItem(id) {
    return axios.get(`${API_URL}/bimester/get/${id}`)
  },
}

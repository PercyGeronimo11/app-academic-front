import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL+'/futs';

export default {
  getMisFuts() {
    return axios.get(API_URL) // Backend debe filtrar por usuario
  },

  getTodosFuts() {
    return axios.get(API_URL)
  },

  crearFut(data) {
    return axios.post(API_URL, data)
  },

  cambiarEstado(id, estado) {
    return axios.patch(`${API_URL}/${id}/estado`, { estado })
  },

  getFut(id) {
    return axios.get(`${API_URL}/${id}`)
  }
}

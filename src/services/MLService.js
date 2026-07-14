import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL_DJANGO

export default {
  updatePredictions(payload) {
    return axios.post(`${API_URL}/ml/predictions/update/`, payload)
  },

  getPredictionsByStudent(studentId) {
    return axios.get(`${API_URL}/ml/predictions/student/${studentId}/`)
  },
}

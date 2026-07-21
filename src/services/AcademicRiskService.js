import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  getScope(schoolYear = null) {
    return axios.get(`${API_URL}/academic-risk/scope`, {
      params: schoolYear ? { school_year: schoolYear } : {},
    })
  },

  getGradeSections(params = {}) {
    return axios.get(`${API_URL}/academic-risk/grade-sections`, { params })
  },

  getStudents(gradeSectionId, params = {}) {
    return axios.get(`${API_URL}/academic-risk/students`, {
      params: {
        grade_section_id: gradeSectionId,
        ...params,
      },
    })
  },

  updatePredictions(payload) {
    return axios.post(`${API_URL}/academic-risk/predictions/update`, payload)
  },

  updatePredictionsAll(payload) {
    return axios.post(`${API_URL}/academic-risk/predictions/update-all`, payload, {
      timeout: 900000,
    })
  },

  predictStudent(payload) {
    return axios.post(`${API_URL}/academic-risk/predictions/student`, payload)
  },

  getDashboard(params) {
    return axios.get(`${API_URL}/academic-risk/dashboard`, { params })
  },

  getClassrooms(params) {
    return axios.get(`${API_URL}/academic-risk/classrooms`, { params })
  },
}

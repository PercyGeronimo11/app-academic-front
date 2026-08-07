import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  listByCourseClass(courseClassId) {
    return axios.get(`${API_URL}/schedules/by-course-class`, {
      params: { course_class_id: courseClassId },
    })
  },

  syncByCourseClass(courseClassId, schedules) {
    return axios.put(`${API_URL}/schedules/by-course-class`, {
      course_class_id: courseClassId,
      schedules,
    })
  },

  list(params = {}) {
    return axios.get(`${API_URL}/schedules`, { params })
  },
}

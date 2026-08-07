import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  listStudentsByCourse(courseClassId, bimesterId = null) {
    return axios.get(`${API_URL}/conduct-incidents/students-by-course`, {
      params: { course_class_id: courseClassId, bimester_id: bimesterId },
    });
  },

  listByCourse(courseClassId, bimesterId = null) {
    return axios.get(`${API_URL}/conduct-incidents/by-course`, {
      params: { course_class_id: courseClassId, bimester_id: bimesterId },
    });
  },

  create(data) {
    return axios.post(`${API_URL}/conduct-incidents`, data);
  },

  myHistory(bimesterId = null, courseClassId = null) {
    return axios.get(`${API_URL}/conduct-incidents/my-history`, {
      params: {
        bimester_id: bimesterId,
        course_class_id: courseClassId,
      },
    });
  },
};

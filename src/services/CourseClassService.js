import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {

  async assignmentCourse(data) {
    return await axios.post(`${API_URL}/course-class/assignment-course`, data);
  },
  async listCoursesByIdGradeSection(id) {
    return await axios.get(`${API_URL}/course-class/list-courses/${id}`);
  },
};

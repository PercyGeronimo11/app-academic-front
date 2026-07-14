import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {

  async assignmentCourse(data) {
    return await axios.post(`${API_URL}/course-class/assignment-course`, data);
  },
  async listCoursesByIdGradeSection(id) {
    return await axios.get(`${API_URL}/course-class/list-courses/${id}`);
  },
  async saveAssignmentTeachers(data) {
    return await axios.post(`${API_URL}/course-class/assignment-teachers`, data);
  },
  async listCoursesByTeacherId(teacherId) {
    return await axios.get(`${API_URL}/course-class/list-by-teacher`, {
      params: { teacher_id: teacherId },
    });
  },
  async listCoursesByIdGrade(idGrade) {
    return await axios.get(`${API_URL}/course-class/get-by-grade`,{
      params:{
        grade_id:idGrade
      }
    });
  },
  async listCoursesByTeacher() {
    return await axios.get(`${API_URL}/course-class/get-by-teacher`);
  },

  async getCourseClass(id) {
    return await axios.get(`${API_URL}/course-class/get`, {
      params:{
        course_class_id : id
      }
    });
  },
};


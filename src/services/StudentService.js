import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 
const API_URL_DJANGO = import.meta.env.VITE_API_URL_DJANGO;

export default {
  async getItems(params = {}) {
    return await axios.get(`${API_URL}/student/list`, {
      params: {
        status: 1,
        ...params,
      },
    });
  },
  
  async getItem(id) {
    return await axios.get(`${API_URL}/student/get`,{
      params: {
        id: id
      },
    });
  },

  async createItem(data) {
    return await axios.post(`${API_URL}/student/create`, data);
  },

  async updateItem(data) {
    return await axios.put(`${API_URL}/student/update`, data);
  },

  async getPathImageQrCode(idStudent) {
    return await axios.get(`${API_URL_DJANGO}/alumno/info/obtener-qr/`, {
      params: {
        id: idStudent
      }
    });
  },

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/student/delete`,{
      data: {
        id: id
      }
    });
  },

  async assingStudent(data) {
    return await axios.post(`${API_URL}/student/assing`, data);
  },

  async getCourse(data) {
    return await axios.get(`${API_URL}/student/listCourses`, {
      params: data
    });
  },
  
  async getItemsByGradeAndSection(idGradeSection) {
    return await axios.get(`${API_URL}/student/listbyGradeAndSection`,{
      params: {
        grade_section_id: idGradeSection
      },
    });
  },

  async getitemsByCourse(data) {
    return await axios.get(`${API_URL}/student/byCourse`, {
      params: data
    });
  },

  async getScoresByStudentAndClass(course_class_id) {
    return await axios.get(`${API_URL}/task/list/byStudentAndClass`, {
      params: {
        course_class_id:course_class_id
      }
    });
  },

  async importStudents(data) {
    return await axios.post(`${API_URL}/student/register-excel`, data, {
      timeout: 0,
    });
  },

  async downloadStudentImportTemplate() {
    return await axios.get(`${API_URL}/student/import-template`, {
      responseType: 'blob',
      timeout: 60000,
    });
  },
};

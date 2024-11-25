import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems(id) {
    return await axios.get(`${API_URL}/task/list`,{
      params: {
        course_class_id: id,
      }
    });
  },
  
  async getItem(id) {
    return await axios.get(`${API_URL}/task/get`,{
      params: {
        id: id
      },
    });
  },

  async createItem(data) {
    return await axios.post(`${API_URL}/task/create`, data);
  },

  async updateItem(data) {
    return await axios.put(`${API_URL}/task/update`, data);
  },

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/task/delete`,{
      data: {
        id: id
      }
    });
  },

  async scoreTaskStudent(data) {
    return await axios.post(`${API_URL}/task/score`, data);
  },

  async scoresGetByUnit(data) {
    return await axios.get(`${API_URL}/task/getbyUnit`, {
      params: data,
    });
  },

  async getItemsByStudentAndClass(course_class_id) {
    return await axios.get(`${API_URL}/task/list/byStudentAndClass`,{
      params: {
        course_class_id: course_class_id
      }
    });
  },
};

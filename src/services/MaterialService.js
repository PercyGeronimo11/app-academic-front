import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems(courseClassId) {
    return await axios.get(`${API_URL}/material/list`,{
      params: {
        course_class_id: courseClassId
      },
    });
  },
  
  async getItem(id) {
    return await axios.get(`${API_URL}/material/get`,{
      params: {
        id: id
      },
    });
  },

  async createItem(data) {
    return await axios.post(`${API_URL}/material/create`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateItem(data) {
    return await axios.put(`${API_URL}/material/update`, data);
  },

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/material/delete`,{
      data: {
        id: id
      }
    });
  },
};

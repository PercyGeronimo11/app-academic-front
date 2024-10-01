import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems() {
    return await axios.get(`${API_URL}/student/list`,{
      params: {
        status: 1,
      }
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

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/student/delete`,{
      data: {
        id: id
      }
    });
  }
};

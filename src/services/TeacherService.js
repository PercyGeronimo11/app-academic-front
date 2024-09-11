import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems(search) {
    return await axios.get(`${API_URL}/teacher/list`,{
      params: {
        status: 1,
        search: search
      }
    });
  },
  
  async getItem(id) {
    return await axios.get(`${API_URL}/teacher/get`,{
      params: {
        id: id
      },
    });
  },

  async createItem(data) {
    return await axios.post(`${API_URL}/teacher/create`, data);
  },

  async updateItem(data) {
    return await axios.put(`${API_URL}/teacher/update`, data);
  },

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/teacher/delete`,{
      data: {
        id: id
      }
    });
  }
};

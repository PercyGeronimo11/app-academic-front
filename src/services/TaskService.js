import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems(data) {
    return await axios.get(`${API_URL}/task/list`,{
      params: {
        data: data,
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
};

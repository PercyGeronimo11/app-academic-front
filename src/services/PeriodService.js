import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  async getItems() {
    return axios.get(`${API_URL}/period/list`);
  },

  async getItem(id) {
    return axios.get(`${API_URL}/period/get`, {
      params: { id },
    });
  },

  async createItem(data) {
    return axios.post(`${API_URL}/period/create`, data);
  },

  async updateItem(data) {
    return axios.put(`${API_URL}/period/update`, data);
  },

  async deleteItem(id) {
    return axios.delete(`${API_URL}/period/delete`, {
      data: { id },
    });
  },
};

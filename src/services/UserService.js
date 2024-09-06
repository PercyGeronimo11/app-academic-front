import axios from 'axios';

const API_URL = env('VITE_API_URL'); 

export default {
  async getUsers() {
    return await axios.get(`${API_URL}/users`);
  },
  
  async getRoles() {
    return await axios.get(`${API_URL}/roles`);
  },

  async createUser(data) {
    return await axios.post(`${API_URL}/users`, data);
  },

  async updateUser(id, data) {
    return await axios.put(`${API_URL}/users/${id}`, data);
  },

  async deleteUser(id) {
    return await axios.delete(`${API_URL}/users/${id}`);
  }
};

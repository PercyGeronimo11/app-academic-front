import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getItems() {
    return await axios.get(`${API_URL}/grade/list`,{
      params: {
        status: 1
      }
    });
  },
};

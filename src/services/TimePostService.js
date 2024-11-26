import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async storeTimePost(data) {
    return await axios.post(`${API_URL}/time-post/store`,data);
  },
  
};

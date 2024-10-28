import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_IA; 

export default {
  async sentPromptService(data) {
    return await axios.post(`${API_URL}/consultar`,data);
  },
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/requests'; 

export default {
  async list() {
    return await axios.get(`${API_URL}`);
  },

  async createPaperwork(data) {
    return await axios.post(`${API_URL}`,data, {
      headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
  },

  async observePartsTable(id, observations) {
    return await axios.post(`${API_URL}/${id}/observe-mesa`, observations);
  },

  async approvePartsTable(id) {
    return await axios.post(`${API_URL}/${id}/approve-mesa`);
  },

  async observeDirector(id, observations) {
    return await axios.post(`${API_URL}/${id}/observe-director`, observations);
  },

  async approvePartsTable(id) {
    return await axios.post(`${API_URL}/${id}/approve-director`);
  },
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  async getGrades() {
    return await axios.get(`${API_URL}/grade/list`,{});
  },

  async getSections() {
    return await axios.get(`${API_URL}/section/list`,{});
  },

  async getGradeSections() {
    return await axios.get(`${API_URL}/grade-section/list`,{});
  },

  async getGradeSection(id) {
    return await axios.get(`${API_URL}/grade-section/get/${id}`);
  },
};

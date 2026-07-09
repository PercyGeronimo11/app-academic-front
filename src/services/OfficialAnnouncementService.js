import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  getTargetGrades() {
    return axios.get(`${API_URL}/official-announcements/target-grades`);
  },

  listPublished() {
    return axios.get(`${API_URL}/official-announcements/published`);
  },

  create(data) {
    return axios.post(`${API_URL}/official-announcements`, data);
  },

  publish(id) {
    return axios.post(`${API_URL}/official-announcements/${id}/publish`);
  },

  getItem(id) {
    return axios.get(`${API_URL}/official-announcements/item/${id}`);
  },

  listMine() {
    return axios.get(`${API_URL}/official-announcements/mine`);
  },

  getMine(id) {
    return axios.get(`${API_URL}/official-announcements/mine/${id}`);
  },

  markRead(id) {
    return axios.patch(`${API_URL}/official-announcements/mine/${id}/read`);
  },
};

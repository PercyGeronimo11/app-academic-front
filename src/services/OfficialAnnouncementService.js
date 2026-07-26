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

  update(id, data) {
    return axios.put(`${API_URL}/official-announcements/${id}`, data);
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

  listInbox() {
    return axios.get(`${API_URL}/official-announcements/inbox`);
  },

  getInboxItem(id) {
    return axios.get(`${API_URL}/official-announcements/inbox/${id}`);
  },

  markInboxRead(id) {
    return axios.patch(`${API_URL}/official-announcements/inbox/${id}/read`);
  },

  listUnreadGeneral() {
    return axios.get(`${API_URL}/official-announcements/unread-general`);
  },

  listUnreadForCourse(courseClassId) {
    return axios.get(`${API_URL}/official-announcements/course/${courseClassId}/unread`);
  },
};

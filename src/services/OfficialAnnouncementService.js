import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const buildFormData = (data) => {
  const formData = new FormData();

  if (data.title != null) formData.append('title', data.title ?? '');
  if (data.body != null) formData.append('body', data.body ?? '');
  if (data.starts_at != null) formData.append('starts_at', data.starts_at ?? '');
  if (data.ends_at != null) formData.append('ends_at', data.ends_at ?? '');
  if (data.publish != null) formData.append('publish', data.publish ? '1' : '0');
  if (data.is_general != null) formData.append('is_general', data.is_general ? '1' : '0');
  if (data.remove_image != null) formData.append('remove_image', data.remove_image ? '1' : '0');

  if (Array.isArray(data.grade_section_ids)) {
    data.grade_section_ids.forEach((id) => {
      formData.append('grade_section_ids[]', String(id));
    });
  }

  if (data.image instanceof File) {
    formData.append('image', data.image);
  }

  return formData;
};

/** Solo fechas de vigencia (comunicado ya publicado). */
const buildVigencyFormData = (data) => {
  const formData = new FormData();
  formData.append('ends_at', data.ends_at ?? '');
  return formData;
};

export default {
  getTargetGrades() {
    return axios.get(`${API_URL}/official-announcements/target-grades`);
  },

  listPublished(params = {}) {
    return axios.get(`${API_URL}/official-announcements/published`, { params });
  },

  create(data) {
    return axios.post(`${API_URL}/official-announcements`, buildFormData(data));
  },

  update(id, data) {
    const body = data.vigency_only ? buildVigencyFormData(data) : buildFormData(data);
    return axios.post(`${API_URL}/official-announcements/${id}`, body);
  },

  publish(id) {
    return axios.post(`${API_URL}/official-announcements/${id}/publish`);
  },

  getItem(id) {
    return axios.get(`${API_URL}/official-announcements/item/${id}`);
  },

  getVisualization(id, filter = 'all') {
    return axios.get(`${API_URL}/official-announcements/${id}/visualization`, {
      params: { filter },
    });
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

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const buildFormData = (data) => {
  const formData = new FormData();
  if (data.id != null) formData.append('id', data.id);
  formData.append('name', data.name ?? '');
  formData.append('description', data.description ?? '');
  if (data.image instanceof File) {
    formData.append('image', data.image);
  }
  return formData;
};

export default {
  async getItems(search) {
    return await axios.get(`${API_URL}/course/list`, {
      params: {
        status: 1,
        search: search,
      },
    });
  },

  async getItem(id) {
    return await axios.get(`${API_URL}/course/get`, {
      params: {
        id: id,
      },
    });
  },

  async createItem(data) {
    return await axios.post(`${API_URL}/course/create`, buildFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateItem(data) {
    // POST + multipart: PHP no parsea bien FormData en PUT
    return await axios.post(`${API_URL}/course/update`, buildFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteItem(id) {
    return await axios.delete(`${API_URL}/course/delete`, {
      data: {
        id: id,
      },
    });
  },
};

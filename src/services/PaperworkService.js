import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/requests';

export default {
  async list() {
    return await axios.get(`${API_URL}`);
  },

  async createPaperwork(data) {
    return await axios.post(`${API_URL}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async updatePaperwork(id, data) {
    return await axios.post(`${API_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async observeMesa(id, observations) {
    return await axios.post(`${API_URL}/${id}/observe-mesa`, { observations });
  },

  async approveMesa(id) {
    return await axios.post(`${API_URL}/${id}/approve-mesa`);
  },

  async observeDirector(id, observations) {
    return await axios.post(`${API_URL}/${id}/observe-director`, { observations });
  },

  async approveDirector(id) {
    return await axios.post(`${API_URL}/${id}/approve-director`);
  },

  async acknowledgeAuxiliar(id) {
    return await axios.post(`${API_URL}/${id}/acknowledge-auxiliar`);
  },

  async downloadPdf(id) {
    const res = await axios.get(`${API_URL}/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tramite-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  /** Blob PDF para vista previa en iframe (misma autenticación que downloadPdf). */
  async fetchPdfBlob(id) {
    const res = await axios.get(`${API_URL}/${id}/pdf`, { responseType: 'blob' });
    return new Blob([res.data], { type: 'application/pdf' });
  },
};

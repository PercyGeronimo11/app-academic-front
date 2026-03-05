import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_DJANGO = import.meta.env.VITE_API_URL_DJANGO;

export default {

  getResumenDiario() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-hoy/`);
  },

  getAsistenciaBySeccion() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-by-seccion/`);
  },

  getResumenSemanal() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-semanal/`);
  },

  registrarAsistenciaAuxiliar(dni) {
    return axios.post(`${API_URL_DJANGO}/assistances/register/`, {
      dni: dni
    }
    );
  },

  getAssistanceByCourseClass(idCourseClass) {
    return axios.get(`${API_URL}/assistances/list`, {
      params: {
        course_class_id: idCourseClass
      }
    });
  },

  listAssistancesByDate(data) {
    return axios.get(`${API_URL}/assistances/by-date`, {
      params: data,
    });
  },

  updateAssistances(data) {
    return axios.post(`${API_URL}/assistances/update`, data);
  },

  listAssistanceFromStudent(id) {
    return axios.get(`${API_URL}/assistance/listByStudent`, {
      params: {
        course_class_id: id
      },
    });
  },

  getReport(id) {
    return axios.get(`${API_URL}/assistances/report`, {
      params: {
        course_class_id: id
      },
    });
  }
};


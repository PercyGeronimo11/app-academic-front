import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_DJANGO = import.meta.env.VITE_API_URL_DJANGO;

export default {
  // Para ADMIN
  getResumenDiario() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-hoy/`);
  },

  getAsistenciaBySeccion() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-by-seccion/`);
  },

  getResumenSemanal() {
    return axios.get(`${API_URL_DJANGO}/assistances/resumen-semanal/`);
  },

  getDetailAssistanceBySeccion(seccionId) {
    return axios.get(`${API_URL_DJANGO}/assistances/detail-by-seccion/${seccionId}/`);
  },


  listarAlumnos: (page = 1, search = '', grade = '', section = '') => {
    return axios.get(`${API_URL_DJANGO}/assistances/listar-alumnos/`, {
      params: {
        page: page,
        search: search,
        grade: grade,
        section: section
      }
    })
  },

  getVAdmin_AlumnoDetail: (alumnoId) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/detail-alumno/${alumnoId}/`);
  },


  getVAdmin_HistorialByAlumno: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/historial-by-alumno/`, {params})
  },

  // Para vista alumnos
  getReporteGeneralAlumno() {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-general/`);
  },

  getAlumnoReporteDetallado(params) {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-detallado/`, { params })
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


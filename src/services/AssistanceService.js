import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_DJANGO = import.meta.env.VITE_API_URL_DJANGO;

const token = localStorage.getItem('access_token');

export default {
  // getResumenSemanal() {
  //   return axios.get(`${API_URL_DJANGO}/assistances/resumen-semanal/`);
  // },

  // Para ADMIN
  getResumenDiario() {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/seguimiento-totales/`);
  },

  getAsistenciaBySeccion(params) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/seguimiento-by-seccion/`, {params});
  },

  getDetailAssistanceBySeccion(seccionId) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/detail-by-seccion/${seccionId}/`);
  },
  
  getDashboardAlumno(idAlumno) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/dashboard-alumno/${idAlumno}/`);
  },

  listarAlumnos: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/listar-alumnos/`, { params })
  },

  getVAdmin_AlumnoDetail: (alumnoId) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/detail-alumno/${alumnoId}/`);
  },


  getVAdmin_HistorialByAlumno: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/historial-by-alumno/`, { params })
  },

  // Para vista alumnos
  getReporteGeneralAlumno() {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-general/`, 
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  getAlumnoReporteDetallado(params) {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-detallado/`, { params },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  },


  // Para el auxiliar
  VAuxiliar_registrarAsistencia(dni) {
    return axios.post(`${API_URL_DJANGO}/assistances/auxiliar/register-assist/`, {
      dni: dni
    }
    );
  },

  VAuxiliar_generarAsistencias(dni) {
    return axios.post(`${API_URL_DJANGO}/assistances/auxiliar/generar-assist/`);
  },

  VAuxiliar_totalesAsistencias(dni) {
    return axios.post(`${API_URL_DJANGO}/assistances/auxiliar/total-asistencias/`);
  },


  getVAuxiliar_listarAlumnos: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/auxiliar/listar-alumnos/`, { params })
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


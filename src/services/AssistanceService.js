import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_DJANGO = import.meta.env.VITE_API_URL_DJANGO;

export default {
  getAsistenciaBySeccion(params) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/seguimiento-by-seccion/`, {params});
  },

  getDetailAssistanceBySeccion(seccionId) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/detail-by-seccion/${seccionId}/`);
  },
  
  getDashboardAlumno(idAlumno, params = {}) {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/dashboard-alumno/${idAlumno}/`, {
      params,
    });
  },

  listarAlumnos: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/listar-alumnos/`, { params })
  },
  
  listarAlumnosExportExcel: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/export-excel/`, { params })
  },


  getVAdmin_AlumnoDetail: (alumnoId) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/detail-alumno/${alumnoId}/`);
  },


  getVAdmin_HistorialByAlumno: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/admin/historial-by-alumno/`, { params })
  },

  getReporteGeneralAlumno(params = {}) {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-general/`, { params });
  },

  getAlumnoReporteDetallado(params) {
    return axios.get(`${API_URL_DJANGO}/assistances/alumno/reporte-detallado/`, { params });
  },


  // Para el auxiliar / dirección / secretaría (JWT vía interceptor axios)
  VAuxiliar_registrarAsistencia(student_code) {
    return axios.post(`${API_URL_DJANGO}/assistances/auxiliar/register-assist/`, {
      student_code,
    })
  },

  VAuxiliar_totalesAsistencias() {
    return axios.post(`${API_URL_DJANGO}/assistances/auxiliar/total-asistencias/`)
  },

  getVAuxiliar_listarAlumnos: (params) => {
    return axios.get(`${API_URL_DJANGO}/assistances/auxiliar/listar-alumnos/`, { params })
  },

  // Carnets QR: secciones habilitadas segun el rol (el auxiliar solo ve sus aulas)
  getSeccionesCarnetsQr() {
    return axios.get(`${API_URL_DJANGO}/assistances/auxiliar/carnets-qr/secciones/`)
  },

  /** Descarga el PDF de carnets QR de una seccion y lo guarda en el dispositivo. */
  async descargarCarnetsQr({ aula_id, grade, section }) {
    const res = await axios.get(`${API_URL_DJANGO}/assistances/auxiliar/carnets-qr/`, {
      params: { aula_id, grade, section },
      responseType: 'blob',
      timeout: 120000,
    })

    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carnets_qr_${grade || ''}${section || ''}.pdf` || 'carnets_qr.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    return Number(res.headers['x-total-carnets']) || null
  },

  listUnjustifiedAbsences(params = {}) {
    return axios.get(`${API_URL_DJANGO}/assistances/unjustified/`, { params })
  },

  justifyAbsence(payload) {
    return axios.post(`${API_URL_DJANGO}/assistances/justify/`, payload)
  },

  correctAssistanceStatus(payload) {
    return axios.post(`${API_URL_DJANGO}/assistances/correct-status/`, payload)
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


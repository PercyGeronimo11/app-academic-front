import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  listBimesters() {
    return axios.get(`${API_URL}/competency-scores/bimesters`);
  },

  reportCard(bimesterId = null, studentId = null) {
    return axios.get(`${API_URL}/competency-scores/report-card`, {
      params: {
        bimester_id: bimesterId,
        student_id: studentId,
      },
    });
  },

  listByCourseClass(courseClassId, bimesterId = null) {
    return axios.get(`${API_URL}/competency-scores/by-course-class`, {
      params: {
        course_class_id: courseClassId,
        bimester_id: bimesterId,
      },
    });
  },

  previewSiagie(file, courseClassId = null, bimesterId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (courseClassId) {
      formData.append('course_class_id', courseClassId);
    }
    if (bimesterId) {
      formData.append('bimester_id', bimesterId);
    }

    return axios.post(`${API_URL}/competency-scores/preview-siagie`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importSiagieForCourseClass(file, courseClassId, bimesterId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_class_id', courseClassId);
    if (bimesterId) {
      formData.append('bimester_id', bimesterId);
    }

    return axios.post(`${API_URL}/competency-scores/import-siagie`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  importSiagieForGradeSection(file, gradeSectionId, bimesterId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('grade_section_id', gradeSectionId);
    if (bimesterId) {
      formData.append('bimester_id', bimesterId);
    }

    return axios.post(`${API_URL}/competency-scores/import-siagie-grade`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

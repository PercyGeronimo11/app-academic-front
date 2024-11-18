import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export default {
  getAssistanceByCourseClass(idCourseClass) {
    return axios.get(`${API_URL}/assistances/list`,{
      params:{
        course_class_id:idCourseClass
      }
    });
  },

  listAssistancesByDate(data) {
    // Pasamos `data` como `params` para que axios pueda enviarlo en la URL
    return axios.get(`${API_URL}/assistances/by-date`, {
      params: data,
    });
  },

};


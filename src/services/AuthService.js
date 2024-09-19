import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  loginService(credentials) {
    return axios.post(`${API_URL}/auth/login`, credentials)
      .then(response => {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('user_name', response.data.data.user.name);
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          // El servidor respondió con un estado de error
          console.error('Error al iniciar sesión:', error.response.data);
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error en la solicitud:', error.request);
        } else {
          // Ocurrió un error al configurar la solicitud
          console.error('Error:', error.message);
        }
        throw error;
      });
  },

  logoutService() {
    const token = localStorage.getItem('access_token');
    return axios.post(`${API_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_name');
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          // El servidor respondió con un estado de error
          console.error('Error al cerrar sesión:', error.response.data);
        } else if (error.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          console.error('Error en la solicitud:', error.request);
        } else {
          // Ocurrió un error al configurar la solicitud
          console.error('Error:', error.message);
        }
        throw error;
      });
  },
};

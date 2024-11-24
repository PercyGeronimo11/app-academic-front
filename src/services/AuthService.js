import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  loginService(credentials) {
    return axios.post(`${API_URL}/auth/login`, credentials)
      .then(response => {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          console.error('Error al iniciar sesión:', error.response.data);
        } else if (error.request) {
          console.error('Error en la solicitud:', error.request);
        } else {
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
        localStorage.removeItem('user');
        return response.data;
      })
      .catch(error => {
        if (error.response) {
          console.error('Error al cerrar sesión:', error.response.data);
        } else if (error.request) {
          console.error('Error en la solicitud:', error.request);
        } else {
          console.error('Error:', error.message);
        }
        throw error;
      });
  },

  getUserDataService() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

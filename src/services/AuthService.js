import axios from "axios";
import { clearSession, getStoredUser } from "@/utils/session";

const API_URL = import.meta.env.VITE_API_URL;

export default {
  loginService(credentials) {
    return axios.post(`${API_URL}/auth/login`, credentials)
      .then(response => {
        const { access_token: accessToken, user } = response.data.data ?? {};
        if (!accessToken || !user) {
          throw new Error('Respuesta de login incompleta');
        }
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
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
        clearSession();
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
    return getStoredUser();
  }
};

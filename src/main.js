import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import OpenChmPlugin from './open-chm';

import App from './App.vue'
import router from './router'
import { clearSession, isJwtUnauthorized } from '@/utils/session'

import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import DocsExample from '@/components/DocsExample'
import '@fortawesome/fontawesome-free/css/all.css';
import '@fontsource-variable/inter'
import '@/styles/design-system/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(CoreuiVue)
app.use(OpenChmPlugin); 
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.component('DocsExample', DocsExample)

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    }, (error) => {
    return Promise.reject(error);
});

let redirectingToLogin = false;

function redirectToLogin() {
    if (redirectingToLogin) return;
    redirectingToLogin = true;
    clearSession();
    if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login', query: { sessionExpired: '1' } }).finally(() => {
            redirectingToLogin = false;
        });
    } else {
        redirectingToLogin = false;
    }
}

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (isJwtUnauthorized(error)) {
            redirectToLogin();
        } else if (error.response) {
            console.error('Error de API:', error);
        }
        return Promise.reject(error);
    }
);

app.mount('#app')

<template>
  <div class="login-shell">
    <!-- Panel institucional: sólo en pantallas grandes -->
    <aside class="login-brand d-none d-lg-flex">
      <div class="login-brand__content">
        <img src="/img/logo_rp.png" alt="" class="login-brand__logo" />
        <h1 class="login-brand__title">I.E. Ricardo Palma 80010</h1>
        <p class="login-brand__text">
          Sistema de Gestión Académica: asistencias, calificaciones, comunicados
          y trámites en un solo lugar.
        </p>
      </div>
      <p class="login-brand__footer">
        © {{ currentYear }} — Institución Educativa Ricardo Palma 80010
      </p>
    </aside>

    <!-- Panel de acceso -->
    <main class="login-form-panel">
      <div class="login-form">
        <img src="/img/logo_rp.png" alt="" class="login-form__logo d-lg-none" />

        <header class="login-form__header">
          <h2 class="login-form__title">Iniciar sesión</h2>
          <p class="login-form__subtitle">
            Ingrese sus credenciales institucionales para continuar.
          </p>
        </header>

        <div v-if="sessionExpired" class="module-alert module-alert--warning" role="alert">
          Su sesión expiró. Inicie sesión nuevamente.
        </div>

        <CForm novalidate @submit.prevent="handleLogin">
          <div class="mb-3">
            <CFormLabel for="login-email">Correo electrónico</CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon="cil-user" />
              </CInputGroupText>
              <CFormInput id="login-email" v-model="email" type="email" placeholder="usuario@ejemplo.edu.pe"
                autocomplete="username" required />
            </CInputGroup>
          </div>

          <div class="mb-4">
            <CFormLabel for="login-password">Contraseña</CFormLabel>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon="cil-lock-locked" />
              </CInputGroupText>
              <CFormInput id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••" autocomplete="current-password" required />
              <CButton type="button" color="secondary" variant="outline"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
              </CButton>
            </CInputGroup>
          </div>

          <CButton color="primary" class="w-100 py-2" type="submit" :disabled="loadingLogin">
            <CSpinner v-if="loadingLogin" size="sm" class="me-2" />
            {{ loadingLogin ? 'Verificando...' : 'Iniciar sesión' }}
          </CButton>
        </CForm>

        <p class="login-form__footer d-lg-none">
          © {{ currentYear }} — Sistema de Gestión Académica
        </p>
      </div>
    </main>
  </div>
</template>

<script>
import AuthService from "@/services/AuthService";
import { ensureStudentPushRegistration } from "@/composables/usePushNotifications";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { getPeruTime } from "@/utils/time";
import { BRAND_COLOR } from "@/utils/brand";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loadingLogin: false,
      sessionExpired: false,
      currentYear: new Date().getFullYear(),
    };
  },
  mounted() {
    this.sessionExpired = this.$route.query.sessionExpired === '1';
  },
  methods: {
    async handleLogin() {
      this.loadingLogin = true;
      try {
        const inicio = getPeruTime();
        localStorage.setItem("tiempoLogin", inicio);

        const credentials = { email: this.email, password: this.password };
        const response = await AuthService.loginService(credentials);
        const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
        const role = response.data.user.role;
        const encryptedRol = CryptoJS.AES.encrypt(role, secretKey).toString();
        localStorage.setItem("r_key", encryptedRol);
        sessionStorage.removeItem('announcements_unread_shown');
        sessionStorage.removeItem('announcements_general_shown');

        if (response.success) {
          if (role === "ESTUDIANTE" || role === "SECRETARIA") {
            ensureStudentPushRegistration();
          }

          this.$router.push("/dashboard");

          Swal.fire({
            toast: true,
            icon: "success",
            title: "Sesión iniciada correctamente",
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error en el inicio de sesión",
            text: "Verifique sus credenciales",
            confirmButtonColor: BRAND_COLOR,
          });
        }
      } catch (error) {
        Swal.fire({
          toast: true,
          icon: "warning",
          title: "Credenciales incorrectas",
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
      } finally {
        this.loadingLogin = false;
      }
    },
  },
};
</script>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  background: var(--rp-bg);
}

@media (min-width: 992px) {
  .login-shell {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  }
}

/* --- Panel de marca ------------------------------------------------------- */

.login-brand {
  flex-direction: column;
  justify-content: space-between;
  padding: var(--rp-space-12) var(--rp-space-10);
  background: var(--rp-brand-600);
  color: var(--rp-text-on-brand);
}

.login-brand__content {
  margin-block: auto;
  max-width: 30rem;
}

.login-brand__logo {
  width: 4.5rem;
  height: auto;
  margin-bottom: var(--rp-space-6);
}

.login-brand__title {
  font-size: 2rem;
  font-weight: var(--rp-weight-bold);
  color: var(--rp-text-on-brand);
  line-height: var(--rp-leading-tight);
  margin-bottom: var(--rp-space-4);
}

.login-brand__text {
  font-size: var(--rp-text-md);
  line-height: var(--rp-leading-normal);
  color: var(--rp-text-on-brand-muted);
  margin: 0;
}

.login-brand__footer {
  margin: 0;
  font-size: var(--rp-text-xs);
  color: var(--rp-text-on-brand-subtle);
}

/* --- Panel de formulario -------------------------------------------------- */

.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rp-space-6) var(--rp-space-4);
  background: var(--rp-surface);
}

.login-form {
  width: 100%;
  max-width: 24rem;
}

.login-form__logo {
  width: 3.5rem;
  height: auto;
  margin-bottom: var(--rp-space-4);
}

.login-form__header {
  margin-bottom: var(--rp-space-6);
}

.login-form__title {
  font-size: var(--rp-text-2xl);
  font-weight: var(--rp-weight-semibold);
  margin-bottom: var(--rp-space-1);
}

.login-form__subtitle {
  margin: 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-base);
}

.login-form__footer {
  margin: var(--rp-space-8) 0 0;
  text-align: center;
  font-size: var(--rp-text-xs);
  color: var(--rp-text-subtle);
}
</style>

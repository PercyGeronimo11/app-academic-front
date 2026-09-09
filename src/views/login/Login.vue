<template>
  <div class="login-shell">
    <!-- Panel institucional: sólo en pantallas grandes -->
    <aside class="login-brand d-none d-lg-flex">
      <div class="login-brand__content">
        <img
          src="/img/logo_rp.png"
          alt="I.E. Ricardo Palma 80010"
          class="login-brand__logo"
        />
        <h1 class="login-brand__title">I.E. Ricardo Palma 80010</h1>
        <p class="login-brand__text">
          Sistema de Gestión Académica: asistencias, calificaciones, comunicados oficiales,
          predicciones académicas, asistente inteligente y trámites virtuales en un solo lugar.
        </p>
      </div>
      <p class="login-brand__footer">
        © {{ currentYear }} — Institución Educativa Ricardo Palma 80010
      </p>
    </aside>

    <!-- Panel de acceso -->
    <main class="login-form-panel">
      <div class="login-form">
        <img
          src="/img/logo_rp.png"
          alt="I.E. Ricardo Palma 80010"
          class="login-form__logo d-lg-none"
        />

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
            <CFormLabel for="login-email">Correo institucional</CFormLabel>
            <CInputGroup :class="{ 'is-invalid': !!errors.email }">
              <CInputGroupText>
                <CIcon icon="cil-user" />
              </CInputGroupText>
              <CFormInput
                id="login-email"
                v-model="email"
                type="email"
                placeholder="usuario@ierp.edu.pe"
                autocomplete="username"
                :invalid="!!errors.email"
                aria-describedby="login-email-error"
                @input="clearFieldError('email')"
              />
            </CInputGroup>
            <div
              v-if="errors.email"
              id="login-email-error"
              class="login-form__error"
              role="alert"
            >
              {{ errors.email }}
            </div>
          </div>

          <div class="mb-3">
            <CFormLabel for="login-password">Contraseña</CFormLabel>
            <CInputGroup :class="{ 'is-invalid': !!errors.password }">
              <CInputGroupText>
                <CIcon icon="cil-lock-locked" />
              </CInputGroupText>
              <CFormInput
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :invalid="!!errors.password"
                aria-describedby="login-password-error"
                @input="clearFieldError('password')"
              />
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
              </CButton>
            </CInputGroup>
            <div
              v-if="errors.password"
              id="login-password-error"
              class="login-form__error"
              role="alert"
            >
              {{ errors.password }}
            </div>
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
import { ensurePushRegistration } from "@/composables/usePushNotifications";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { getPeruTime } from "@/utils/time";
import { BRAND_COLOR } from "@/utils/brand";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loadingLogin: false,
      sessionExpired: false,
      currentYear: new Date().getFullYear(),
      errors: {
        email: "",
        password: "",
      },
    };
  },
  mounted() {
    this.sessionExpired = this.$route.query.sessionExpired === '1';
  },
  methods: {
    clearFieldError(field) {
      if (this.errors[field]) {
        this.errors[field] = "";
      }
    },
    validateForm() {
      const errors = { email: "", password: "" };
      const email = this.email.trim();
      const password = this.password;

      if (!email) {
        errors.email = "Ingrese su correo electrónico.";
      } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Ingrese un correo electrónico válido.";
      }

      if (!password) {
        errors.password = "Ingrese su contraseña.";
      }

      this.errors = errors;
      return !errors.email && !errors.password;
    },
    async handleLogin() {
      if (!this.validateForm()) {
        return;
      }

      this.loadingLogin = true;
      try {
        const inicio = getPeruTime();
        localStorage.setItem("tiempoLogin", inicio);

        const credentials = { email: this.email.trim(), password: this.password };
        const response = await AuthService.loginService(credentials);
        const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
        const role = response.data.user.role;
        const encryptedRol = CryptoJS.AES.encrypt(role, secretKey).toString();
        localStorage.setItem("r_key", encryptedRol);
        sessionStorage.removeItem('announcements_unread_shown');
        sessionStorage.removeItem('announcements_general_shown');

        if (response.success) {
          if (role === "ESTUDIANTE" || role === "SECRETARIA") {
            // Esperar el registro para que device_tokens quede ligado al usuario actual
            // antes de navegar (evita condiciones de carrera con el layout).
            await ensurePushRegistration(role);
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
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--rp-space-12) var(--rp-space-10);
  background:
    radial-gradient(ellipse 80% 60% at 20% 15%, rgba(255, 255, 255, 0.14), transparent 55%),
    linear-gradient(160deg, var(--rp-brand-500) 0%, var(--rp-brand-600) 48%, var(--rp-brand-700) 100%);
  color: var(--rp-text-on-brand);
  overflow: hidden;
}

.login-brand::after {
  content: "";
  position: absolute;
  inset: auto -20% -30% auto;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.login-brand__content {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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

.login-form__error {
  margin-top: var(--rp-space-1);
  font-size: var(--rp-text-xs);
  color: var(--rp-danger-500);
}

.login-form__help {
  margin: 0 0 var(--rp-space-4);
  font-size: var(--rp-text-xs);
  color: var(--rp-text-subtle);
  line-height: var(--rp-leading-normal);
}

.login-form__footer {
  margin: var(--rp-space-8) 0 0;
  text-align: center;
  font-size: var(--rp-text-xs);
  color: var(--rp-text-subtle);
}
</style>

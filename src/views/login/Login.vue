<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="login-card shadow-lg rounded-4 bg-white p-5 text-center animate-fade">
      <div class="mb-4">
        <img src="/img/logo_rp.png" alt="Logo" class="login-logo mb-3" />
        <h3 class="fw-bold text-primary mb-1">I.E. RICARDO PALMA 80010</h3>
        <p class="text-muted">Acceda a su cuenta</p>
      </div>

      <CForm @submit.prevent="handleLogin">
        <CInputGroup class="mb-3">
          <CInputGroupText class="bg-primary text-white border-0">
            <CIcon icon="cil-user" />
          </CInputGroupText>
          <CFormInput
            v-model="email"
            placeholder="Correo electrónico"
            autocomplete="username"
            required
          />
        </CInputGroup>

        <CInputGroup class="mb-4">
          <CInputGroupText class="bg-primary text-white border-0">
            <CIcon icon="cil-lock-locked" />
          </CInputGroupText>
          <CFormInput
            v-model="password"
            type="password"
            placeholder="Contraseña"
            autocomplete="current-password"
            required
          />
        </CInputGroup>

        <CButton color="primary" class="w-100 fw-semibold py-2" type="submit">
          Iniciar sesión
        </CButton>

        <CButton color="link" class="mt-3 text-decoration-none text-primary">
          ¿Olvidó su contraseña?
        </CButton>
      </CForm>

      <hr class="my-4" />

      <small class="text-muted d-block">
        © {{ new Date().getFullYear() }} — Sistema de Gestión Escolar
      </small>
    </div>
  </div>
</template>

<script>
import AuthService from "@/services/AuthService";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { getPeruTime } from "@/utils/time";

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async handleLogin() {
      try {
        const inicio = getPeruTime();
        localStorage.setItem("tiempoLogin", inicio);

        const credentials = { email: this.email, password: this.password };
        const response = await AuthService.loginService(credentials);
        const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
        const role = response.data.user.role;
        const encryptedRol = CryptoJS.AES.encrypt(role, secretKey).toString();
        localStorage.setItem("r_key", encryptedRol);

        if (response.success) {
          let route = "/";
          if (role === "Administrador" || role === "Administrativo") route = "/dashboard";
          else if (role === "Profesor") route = "/mainAreaTeacher";
          else if (role === "Estudiante") route = "/mainAreaStudent";
          this.$router.push(route);

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
            confirmButtonColor: "#0d6efd",
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
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
  background-attachment: fixed;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.login-logo {
  width: 90px;
  height: auto;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.15));
}

.animate-fade {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

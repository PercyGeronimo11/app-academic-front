<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="handleLogin">
                  <h1>I.E. RICARDO PALMA 80010</h1>
                  <p class="text-body-secondary">Acceder a su cuenta</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="email"
                      placeholder="Email"
                      autocomplete="username"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                    />
                  </CInputGroup>
                  <CRow>
                    <CCol :xs="6">
                      <CButton color="primary" class="px-4" type="submit">
                        Iniciar sesión
                      </CButton>
                    </CCol>
                    <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0">
                        ¿Olvidó su contraseña?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <img src="/img/logo_rp.png" alt="Logo" />
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import AuthService from "@/services/AuthService";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";

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
        const inicio = Date.now();
        localStorage.setItem("tiempoLogin", inicio);
        const credentials = {
          email: this.email,
          password: this.password,
        };

        const response = await AuthService.loginService(credentials);

        const secretKey = import.meta.env.VITE_ROLE_KEY.toString();

        const role = response.data.user.role;
        const encryptedRol = CryptoJS.AES.encrypt(role, secretKey).toString();
        console.log(encryptedRol);
        localStorage.setItem("r_key", encryptedRol); //role_key
        if (response.success) {
          console.log("Inicio de sesión exitoso:", response);
          this.$router.push("/dashboard");
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: "success",
            title: "Sesión iniciada correctamente",
          });
        } else {
          console.error("Error en el inicio de sesión:", response.message);
          alert("Error en el inicio de sesión. Verifique sus credenciales.");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "warning",
          title: "Credenciales incorrectas",
        });
      }
    },
  },
};
</script>

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
import AuthService from '@/services/AuthService'; 
import CryptoJS from 'crypto-js';

export default {
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const credentials = {
          email: this.email,
          password: this.password,
        };

        const response = await AuthService.loginService(credentials);
        
        const secretKey = import.meta.env.VITE_ROLE_KEY.toString();

        const role = response.data.user.role;
        const encryptedRol = CryptoJS.AES.encrypt(role, secretKey).toString();
        console.log(encryptedRol);
        localStorage.setItem('r_key', encryptedRol);//role_key

        if (response.success) {
          // Maneja la respuesta de éxito, como almacenar el token y redirigir
          console.log('Inicio de sesión exitoso:', response);
          // Redirige al dashboard o almacena el token en el almacenamiento local
          this.$router.push('/dashboard');
        } else {
          // Maneja los errores de inicio de sesión
          console.error('Error en el inicio de sesión:', response.message);
          alert('Error en el inicio de sesión. Verifique sus credenciales.');
        }
      } catch (error) {
        // Maneja los errores de la solicitud
        console.error('Error en la solicitud:', error);
        alert('Error en la solicitud. Por favor intente nuevamente.');
      }
    },
  },
};
</script>

<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4 p-3 card-custom">
        <div class="section-header">
          <strong>{{ title }}</strong>
        </div>
        <div class="section-content">
          <p>{{ description }}</p>
        </div>
        <div class="section-content score">
          <p><b>Calificación:</b> {{ score !== "" ? score : '-----' }}</p>
        </div>
        <div class="delete-button text-white">
          <div v-if="ConfirmRole('Profesor')">
            <CButton color="danger" @click="$emit('delete', id)" class="delete-button text-white">Eliminar</CButton>
          </div>
          <div v-if="ConfirmRole('Profesor')">
            <CButton color="success" @click="$emit('score', id)" class="delete-button text-white">Calificar</CButton>
          </div>
        </div>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import CryptoJS from 'crypto-js';
const role_key = localStorage.getItem('r_key') || 'guest'
const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
const decryptedRole = CryptoJS.AES.decrypt(role_key, secretKey).toString(CryptoJS.enc.Utf8)
defineProps({
  title: String,
  description: String,
  id: Number,
  score: String
});
const ConfirmRole = (role) => {
  return (decryptedRole==role);
};
</script>

<style scoped>
.card-custom {
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #fdfdfd;
}

.section-header {
  border-bottom: 2px solid #013368;
  margin-bottom: 15px;
  padding-bottom: 8px;
  font-size: 1.5em;
  color: #333;
}

.section-content p {
  font-size: 1.1em;
  line-height: 1.5;
  color: #666;
  margin: 0;
}

.delete-button {
  float: right; /* Posiciona el botón a la derecha */
  margin-left: 10px; /* Agrega un espacio entre el botón y el contenido */
}

.score{
  margin-top: 5px;
}
</style>
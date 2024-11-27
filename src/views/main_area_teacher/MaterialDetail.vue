<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4 p-3 card-material">
        <div class="material-header">
          <i class="fas fa-file-pdf fa-2x text-danger me-3"></i>
          <strong>MATERIAL: {{ title }}</strong>
        </div>
        <div class="material-actions d-flex justify-content-end align-items-center">
          <CButton
            color="primary"
            class="me-2"
            title="Visualizar"
            @click="viewMaterial(pathFile)"
          >
            <i class="fas fa-eye"></i> Visualizar
          </CButton>
        </div>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { computed } from "vue";
import { getPeruTime } from "@/utils/time";
import TimePostService from "../../services/TimePostService";

defineProps({
  title: String,
  pathFile: String,  
});

const viewMaterial = async (pathFile) => {
  const apiUrl = import.meta.env.VITE_API_URL.replace("/api", "");
  const fileUrl = `${apiUrl}/storage/${pathFile}`;
  const data = {
    time_report_start: localStorage.getItem("tiempoLogin"),
    time_report_end: getPeruTime(),
    number_indicator: '2'
  };
  try {
    const response = await TimePostService.storeTimePost(data);
    console.log("Tiempo registrado correctamente:", response.data.data);
  } catch (error) {
    console.error("Error al registrar el tiempo:", error);
  }
  window.open(fileUrl, "_blank");
};


</script>

<style scoped>
.card-material {
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #f7f9fc;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.material-header {
  display: flex;
  align-items: center;
  font-size: 1.25em;
  border-bottom: 2px solid #013368;
  padding-bottom: 10px;
  margin-bottom: 15px;
  color: #333;
}

.material-actions {
  gap: 10px;
}
</style>

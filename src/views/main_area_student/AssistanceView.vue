<template>
  <div>
    <CRow class="mb-3">
      <CCol>
        <h2 class="mb-3">Asistencias del Estudiante</h2>
      </CCol>
    </CRow>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Fecha
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Hora Inicio
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Hora Fin
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Estado
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="assistance in assistances" :key="assistance.id">
          <CTableDataCell>
            <div class="text-center">{{ assistance.date_assistance }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ assistance.hour_start }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ assistance.hour_end }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">
              <span :class="getStatusClass(assistance.status)">
                {{ assistance.status }}
              </span>
            </div>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AssistanceService from "../../services/AssistanceService";

const assistances = ref([]);


const fetchAssistancesByStudent = async () => {
  try {
    const response = await AssistanceService.listAssistanceFromStudent(1);
    if (response && response.data && response.data.data) {
      assistances.value = response.data.data;
    } else {
      console.error("Unexpected response structure:", response);
    }
  } catch (error) {
    console.error("Error fetching assistances:", error);
  }
};


const getStatusClass = (status) => {
  switch (status) {
    case "PRESENTE":
      return "text-success";
    case "AUSENTE":
      return "text-danger";
    default:
      return "text-muted";
  }
};

onMounted(fetchAssistancesByStudent);

</script>

<style>
.text-success {
  color: green;
}
.text-danger {
  color: red;
}
.text-muted {
  color: gray;
}
</style>

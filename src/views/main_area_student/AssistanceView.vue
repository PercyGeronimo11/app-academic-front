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
        <template v-if="!assistances.length">
          <CTableRow>
            <CTableDataCell colspan="4" class="list-empty-message py-4">
              No hay registros para mostrar.
            </CTableDataCell>
          </CTableRow>
        </template>
        <template v-else>
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
        </template>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AssistanceService from "../../services/AssistanceService";
import { useRoute} from "vue-router";

const route = useRoute();
const assistances = ref([]);
const course_class_id = Number(route.params.courseClass);

const fetchAssistancesByStudent = async () => {
  try {
    const response = await AssistanceService.listAssistanceFromStudent(course_class_id);
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
    case "asistio":
      return "status-success";
    case "falto":
      return "status-danger";
    default:
      return "status-muted";
  }
};

onMounted(fetchAssistancesByStudent);

</script>

<style>
.status-success, .status-danger, .status-muted {
  display: inline-block;
  padding: 0.5em 1em;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.status-success {
  color: aliceblue;
  background-color: #28a745; /* Verde */
}

.status-danger {
  color: white;
  background-color: #dc3545; /* Rojo */
}

.status-muted {
  color: white;
  background-color: #6c757d; /* Gris */
}
</style>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4">Asistencias por Fecha</h2>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">#</CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">Fecha</CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center"
            >Hora de Inicio</CTableHeaderCell
          >
          <CTableHeaderCell class="bg-body-secondary text-center"
            >Hora de Fin</CTableHeaderCell
          >
          <CTableHeaderCell class="bg-body-secondary text-center">Día</CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center"
            >Acciones</CTableHeaderCell
          >
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(item, index) in assistances" :key="item.date_assistance">
          <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
          <CTableDataCell class="text-center">{{ item.date_assistance }}</CTableDataCell>
          <CTableDataCell class="text-center">{{
            item.horary_data.hour_start
          }}</CTableDataCell>
          <CTableDataCell class="text-center">{{
            item.horary_data.hour_end
          }}</CTableDataCell>
          <CTableDataCell class="text-center">{{
            item.horary_data.day_week
          }}</CTableDataCell>
          <CTableDataCell class="text-center">
            <CButton
              color="info"
              class="text-white"
              @click="showStudentAssistances(item.date_assistance)"
            >
              Ver Asistencias
            </CButton>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AssistanceService from "../../services/AssistanceService";
import { useRoute, useRouter} from "vue-router";
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
} from "@coreui/vue";
import { data } from "autoprefixer";

const route = useRoute();
const router =useRouter()
const assistances = ref([]);
const selectedDate = ref(null);

// Función para obtener las asistencias desde la API
const fetchAssistances = async () => {
  try {
    const idcourseclass = route.params.courseClass;
    const response = await AssistanceService.getAssistanceByCourseClass(idcourseclass);
    assistances.value = response.data.data;
  } catch (error) {
    console.error("Error al obtener las asistencias", error);
  }
};

const showStudentAssistances = (date) => {
  const idcourseclass = route.params.courseClass;
  router.push({
    path: `/teacher/${idcourseclass}/assistance-students/${date}`,
  });
};


onMounted(fetchAssistances); 
</script>

<style scoped>
.bg-body-secondary {
  background-color: #f8f9fa;
}
</style>

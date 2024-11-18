<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4">
      Marcar Asistencia para {{ route.params.date }}
    </h2>
    <div class="flex items-center mb-4">
      <CInputGroup>
        <CFormInput
          v-model="searchTerm"
          placeholder="Buscar por fecha o estado"
          aria-label="Buscar por fecha o estado"
        />
        <CButton type="button" color="primary" @click="filterAssistances">Buscar</CButton>
      </CInputGroup>
    </div>
    <div v-if="filteredAssistances.length > 0">
      <CTable class="border border-gray-200 rounded-lg shadow-lg" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="text-center font-semibold">Fecha</CTableHeaderCell>
            <CTableHeaderCell class="text-center font-semibold">Estado</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow
            v-for="(assistance, index) in filteredAssistances"
            :key="assistance.id"
          >
            <CTableDataCell class="text-center">{{
              assistance.date_assistance
            }}</CTableDataCell>
            <CTableDataCell class="text-center">
              <div class="grid grid-cols-2 gap-2 md:flex md:justify-center">
                <CFormCheck
                  v-for="(option, optionIndex) in statusOptions"
                  :key="optionIndex"
                  :id="`status-${index}-${optionIndex}`"
                  type="radio"
                  :label="option"
                  :checked="assistance.status === option"
                  @change="updateStatus(index, option)"
                  inline
                />
              </div>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
    <div v-else>
      <p class="text-center text-gray-500">No hay asistencias para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AssistanceService from "../../services/AssistanceService";
import { useRoute, useRouter } from "vue-router";
import {
  CTable,
  CTableRow,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableDataCell,
  CInputGroup,
  CFormInput,
  CButton,
  CFormCheck,
} from "@coreui/vue";

// Uso de hooks de vue-router
const route = useRoute();
const router = useRouter();

// Variables reactivas
const assistances = ref([]);
const searchTerm = ref("");
const statusOptions = ["asistio", "falto", "tardanza", "falta justificada"];

// Llamada a la API para obtener asistencias
const fetchAssistances = async () => {
  try {
    // Accede a los parámetros directamente desde route.params
    const selectedDate = route.params.date;
    const idcourseclass = route.params.courseClass;

    const data = {
      course_class_id: idcourseclass,
      date_assistance: selectedDate,
    };

    const response = await AssistanceService.listAssistancesByDate(data);
    assistances.value = response.data.data;
  } catch (error) {
    console.error("Error al obtener las asistencias:", error);
  }
};

// Computed para las asistencias filtradas
const filteredAssistances = computed(() =>
  assistances.value.filter(
    (assistance) =>
      assistance.date_assistance.includes(route.params.date) ||
      (assistance.status &&
        assistance.status.toLowerCase().includes(searchTerm.value.toLowerCase()))
  )
);

// Método para actualizar el estado de la asistencia
const updateStatus = (index, selectedStatus) => {
  assistances.value[index].status = selectedStatus;
};

// Llamada a la API al montar el componente
onMounted(fetchAssistances);
</script>

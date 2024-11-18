<template>
  <div class="p-4">
    <h2 class="text-2xl font-semibold mb-4 text-center">
      Marcar Asistencia para {{ route.params.date }}
    </h2>
    <div v-if="filteredAssistances.length > 0">
      <CTable class="border border-gray-200 rounded-lg shadow-lg" hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="text-center font-semibold">Alumno</CTableHeaderCell>
            <CTableHeaderCell class="text-center font-semibold">Estado</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow
            v-for="(assistance, index) in filteredAssistances"
            :key="assistance.id"
          >
            <CTableDataCell class="text-start">
              {{ assistance.student_name }}
            </CTableDataCell>
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
      <div class="mt-4 flex justify-end">
        <CButton type="button" color="success" @click="saveAssistances">
          Guardar Cambios
        </CButton>
        <CButton type="button" color="secondary" @click="goToBack"> Retroceder </CButton>
      </div>
    </div>

    <div v-else>
      <p class="text-center text-gray-500">No hay asistencias para mostrar.</p>
    </div>
  </div>
  <CToast
    v-if="toast.visible"
    :autohide="true"
    :color="toast.color"
    class="text-white toast-bottom-right"
    visible
  >
    <div class="d-flex">
      <CToastBody>{{ toast.message }}</CToastBody>
      <CToastClose class="me-2 m-auto" @click="toast.visible = false" white />
    </div>
  </CToast>
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

const toast = ref({
  visible: false,
  message: "",
  color: "primary",
});
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


const goToBack = () => {
  router.go(-1); 
};

const saveAssistances = async () => {
  try {
    const updatedAssistances = assistances.value.map((assistance) => ({
      id: assistance.id,
      status: assistance.status,
    }));

    const response = await AssistanceService.updateAssistances(updatedAssistances);
    if (response.data.success) {
      showToast("Se ha actulizado la asistencia correctamente", "success");
    } 
  } catch (error) {
    console.error("Error al guardar las asistencias:", error);
    alert("Ocurrió un error al guardar los cambios.");
  }
};

const showToast = (message, color) => {
  toast.value = {
    message: message,
    color: color,
    visible: true,
  };

  setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
};

onMounted(fetchAssistances);
</script>

<style scoped>
.toast-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}
</style>

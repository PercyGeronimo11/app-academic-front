<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">Crear Horario</h1>
      <CForm @submit.prevent="createHorario" class="space-y-4">
        <CContainer>
          <CRow class="mb-3">
            <CCol>
              <CFormInput
                v-model="dataHorary.date_start"
                type="date"
                label="Fecha de inicio"
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                v-model="dataHorary.date_end"
                type="date"
                label="Fecha fin"
                required
              />
            </CCol>
          </CRow>

          <CRow class="mb-3">
            <CCol>
              <label class="block text-gray-600 mb-2">Días de la Semana:</label>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="dia in diasSemana" :key="dia" class="flex items-center">
                  <CFormCheck :value="dia" v-model="dataHorary.days_week" class="mr-2" />
                  <span>{{ dia }}</span>
                </div>
              </div>
            </CCol>
            <CCol>
              <CFormInput
                v-model="dataHorary.hour_start"
                type="time"
                label="Hora de Inicio"
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                v-model="dataHorary.hour_end"
                type="time"
                label="Hora de Fin"
                required
              />
            </CCol>
          </CRow>

          <CRow class="mb-3">
            <CCol class="d-grid gap-5 d-md-flex justify-content-md-center">
              <CButton
                color="secondary"
                @click="
                  () => {
                    resetForm();
                  }
                "
              >
                Cancelar
              </CButton>
              <CButton color="primary" @click="createHorario()"> Crear </CButton>
            </CCol>
          </CRow>
        </CContainer>
      </CForm>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRoute} from "vue-router";
import CourseClassService from "../../services/CourseClassService";

const route=useRoute();
const toast = ref({
  visible: false,
  message: "",
  color: "primary",
});

const dataHorary = ref({
  course_class_id:"",
  date_start: "",
  date_end: "",
  days_week: [],
  hour_start: "",
  hour_end: "",
});

const diasSemana = ref([
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
]);


const createHorario = async () => {
  try {
    const idcourseclass=route.params.courseClass;
    dataHorary.value.course_class_id=idcourseclass;
    const response = await CourseClassService.createHorary(dataHorary.value);
    console.log('Response from API:', response.data);
    showToast("Se a creado el horario exitosamente", "success");
    resetForm();
  } catch (error) {
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
      showToast(`Error: ${error.response.data.message || 'Error desconocido'}`, "error");
    } else if (error.request) {
      console.error("Error Request:", error.request);
      showToast("No se recibió respuesta del servidor", "error");
    } else {
      console.error("Error Message:", error.message);
      showToast("Error en la solicitud", "error");
    }
  }
};

const showToast = (message, color) => {
  toast.value = { 
    message: message,
    color: color,
    visible: true 
  };
  
  setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
};
const resetForm = () => {
  dataHorary.value = {
    date_start: "",
    date_end: "",
    days_week: [],
    hour_start: "",
    hour_end: "",
  };
};


</script>

<style></style>

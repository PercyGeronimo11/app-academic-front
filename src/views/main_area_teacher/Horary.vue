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

          <CRow v-for="(dia, index) in dataHorary.days_week" :key="dia.nombre" class="mb-3">
            <CCol>
              <div class="grid grid-cols-2 gap-2">
                <CFormCheck
                  v-model="dia.seleccionado"
                  class="mr-2"
                  :label="dia.nombre"
                />
              </div>
            </CCol>
            <CCol>
              <CFormInput
                v-model="dia.horaInicio"
                type="time"
                label="Hora de Inicio"
                :disabled="!dia.seleccionado"
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                v-model="dia.horaFin"
                type="time"
                label="Hora de Fin"
                :disabled="!dia.seleccionado"
                required
              />
            </CCol>
          </CRow>

          <CRow class="mb-3">
            <CCol class="d-grid gap-5 d-md-flex justify-content-md-center">
              <CButton color="secondary" @click="resetForm">Cancelar</CButton>
              <CButton color="primary" @click="createHorario">Crear</CButton>
            </CCol>
          </CRow>
        </CContainer>
      </CForm>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import CourseClassService from "../../services/CourseClassService";

const route = useRoute();
const toast = ref({
  visible: false,
  message: "",
  color: "primary",
});

const dataHorary = ref({
  course_class_id: "",
  date_start: "",
  date_end: "",
  days_week: [
    { nombre: "Lunes", horaInicio: "", horaFin: "", seleccionado: false },
    { nombre: "Martes", horaInicio: "", horaFin: "", seleccionado: false },
    { nombre: "Miércoles", horaInicio: "", horaFin: "", seleccionado: false },
    { nombre: "Jueves", horaInicio: "", horaFin: "", seleccionado: false },
    { nombre: "Viernes", horaInicio: "", horaFin: "", seleccionado: false },
  ],
});

const createHorario = async () => {
  try {
    const idcourseclass = route.params.courseClass;
    dataHorary.value.course_class_id = idcourseclass;

    const selectedDays = dataHorary.value.days_week
      .filter((day) => day.seleccionado)
      .map((day) => ({
        day: day.nombre,
        hour_start: day.horaInicio,
        hour_end: day.horaFin,
      }));

    const response = await CourseClassService.createHorary({
      ...dataHorary.value,
      days_week: selectedDays,
    });

    console.log("Response from API:", response.data);
    showToast("Se ha creado el horario exitosamente", "success");
    resetForm();
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data);
      showToast(`Error: ${error.response.data.message || "Error desconocido"}`, "error");
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
    visible: true,
  };

  setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
};

const resetForm = () => {
  dataHorary.value = {
    course_class_id: "",
    date_start: "",
    date_end: "",
    days_week: [
      { nombre: "Lunes", horaInicio: "", horaFin: "", seleccionado: false },
      { nombre: "Martes", horaInicio: "", horaFin: "", seleccionado: false },
      { nombre: "Miércoles", horaInicio: "", horaFin: "", seleccionado: false },
      { nombre: "Jueves", horaInicio: "", horaFin: "", seleccionado: false },
      { nombre: "Viernes", horaInicio: "", horaFin: "", seleccionado: false },
    ],
  };
};
</script>

<template>
  <div class="course-section">
    <h1 class="course-title">Curso de {{ courseClassData.course_name }}</h1>
    <CButton class="mb-3" color="warning" v-if="ConfirmRole()" @click="ReportAssistence">
      <b>Reporte general de asistencia</b>
    </CButton>
    <div>
      <h2 @click="toggleGeneralVisibility" class="general-title">
        General
        <i :class="isvisibleGeneral ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </h2>
      <div v-if="isvisibleGeneral">
        <CRow>
          <CCol :xs="12">
            <CCard class="mb-4 p-3 card-custom">
              <div class="section-header">
                <a href=""><strong>Descripción general</strong></a>
              </div>
              <div class="section-content">
                <p>En el curso aprenderás de la mejor manera</p>
              </div>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol :xs="12">
            <CCard class="mb-4 p-3 card-custom card_attendence">
              <div class="section-header">
                <router-link
                  :to="`/teacher/${course_class_id}/assistance`"
                  class="course-quick-link course-quick-link--attendance"
                >
                  <i class="fas fa-clipboard-check"></i>
                  Tomar asistencia
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  :to="`/teacher/${course_class_id}/conduct`"
                  class="course-quick-link course-quick-link--conduct"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                  Incidentes de conducta
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  :to="`/teacher/${course_class_id}/grades`"
                  class="course-quick-link course-quick-link--grades"
                >
                  <i class="fas fa-chart-bar"></i>
                  Notas por competencia
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  :to="`/teacher/${course_class_id}/grades/import`"
                  class="course-quick-link course-quick-link--import"
                >
                  <i class="fas fa-file-excel"></i>
                  Importar notas SIAGIE
                </router-link>
              </div>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CryptoJS from "crypto-js";
import { useRoute, useRouter } from "vue-router";
import CourseClassService from "@/services/CourseClassService";

const route = useRoute();
const router = useRouter();

const role_key = localStorage.getItem("r_key") || "guest";
const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
const decryptedRole = CryptoJS.AES.decrypt(role_key, secretKey).toString(
  CryptoJS.enc.Utf8
);

const course_class_id = Number(route.params.courseClass);
const isvisibleGeneral = ref(false);

const courseClassData = ref({
  course_name: "",
  teacher_name: "",
});

onMounted(() => {
  getCourseClassData();
});

function toggleGeneralVisibility() {
  isvisibleGeneral.value = !isvisibleGeneral.value;
}

const ConfirmRole = () => {
  return decryptedRole == "Profesor";
};

const getCourseClassData = async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id);
    courseClassData.value = response.data.data;
  } catch (error) {
    console.error("Error al cargar datos del curso:", error);
  }
};

const ReportAssistence = async () => {
  router.push({
    name: "StudentAssistence",
    params: {
      course_class_id: course_class_id,
    },
  });
};
</script>

<style scoped>
.course-title {
  color: #034285;
  text-align: center;
  margin-bottom: 1.5em;
  transition: color 0.3s;
}

.general-title {
  cursor: pointer;
  color: #0056b3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2em;
  margin-top: 1em;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
  transition: color 0.3s;
}

.general-title:hover {
  color: #004094;
}

i {
  margin-left: 10px;
}

.card_attendence div {
  margin: 10px 0px;
}
</style>

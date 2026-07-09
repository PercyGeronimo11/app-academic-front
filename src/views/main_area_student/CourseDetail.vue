<template>
  <div class="course-section">
    <h1 class="course-title">Curso de {{ courseClassData.course_name }}</h1>

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
                  :to="`/student/courseClass/${course_class_id}/assistance`"
                  class="course-quick-link course-quick-link--attendance"
                >
                  <i class="fas fa-clipboard-check"></i>
                  Ver asistencias
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  :to="`/student/courseClass/${course_class_id}/scores`"
                  class="course-quick-link course-quick-link--grades"
                >
                  <i class="fas fa-chart-bar"></i>
                  Ver notas del curso
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  to="/my-report-card"
                  class="course-quick-link course-quick-link--import"
                >
                  <i class="fas fa-book-open"></i>
                  Mi libreta de notas
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
import { useRoute } from "vue-router";
import CourseClassService from "@/services/CourseClassService";

const route = useRoute();

const course_class_id = Number(route.params.courseClass);
const isvisibleGeneral = ref(false);
const courseClassData = ref({ course_name: "", teacher_name: "" });

onMounted(() => {
  getCourseClassData();
});

const getCourseClassData = async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id);
    courseClassData.value = response.data.data;
  } catch (error) {
    console.error("Error al obtener datos del curso:", error);
  }
};

const toggleGeneralVisibility = () => {
  isvisibleGeneral.value = !isvisibleGeneral.value;
};
</script>

<style>
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
</style>

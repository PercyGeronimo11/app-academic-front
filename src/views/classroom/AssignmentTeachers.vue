<template>
  <div class="listCourses-wrapper">
    <h1>Asignación de profesores</h1>
    <div v-if="listCoursesClass.length" class="listCourses-container">
      <div
        v-for="(course, index) in listCoursesClass"
        :key="course.course_class_id"
        class="course-item"
      >
        <div class="course-info">
          <h3>{{ course.course_name }}</h3>
        </div>
        <div class="professor-select">
          <select v-model="selectedTeachers[index]" class="styled-select">
            <option value="">Seleccionar profesor</option>
            <option
              v-for="professor in listTeachers"
              :key="professor.id"
              :value="professor.id"
            >
              {{ professor.name }} {{ professor.surname_mother }}
              {{ professor.surname_father }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="button-container">
      <button @click="saveAssignments" class="styled-button"> Guardar
      </button>
      <button @click="backToAulas" class="styled-button">Regresar</button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseClassService from "@/services/CourseClassService";
import TeacherService from "@/services/TeacherService";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2"; 

const route = useRoute();
const router = useRouter();
const listCoursesClass = ref([]);
const listTeachers = ref([]);
const selectedTeachers = ref([]);
const toast = ref({
  visible: false,
  message: "",
  color: "primary",
});

// Función para listar cursos y profesores
const listItems = async () => {
  const id = route.params.id;
  try {
    const coursesResponse = await CourseClassService.listCoursesByIdGradeSection(id);
    listCoursesClass.value = coursesResponse.data.data;

    const listTeachersResponse = await TeacherService.getItems();
    listTeachers.value = listTeachersResponse.data.data;

    selectedTeachers.value = listCoursesClass.value.map(
      (course) => course.teacher_id || ""
    );
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

// Función para volver a la lista de aulas
const backToAulas = () => {
  router.push(`/classroom/list`);
};

const confirmSaveAssignments = () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Quieres guardar las asignaciones?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      saveAssignments();
    }
  });
};

// Función para mostrar el toast
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
// Función para guardar asignaciones
const saveAssignments = async () => {
  const assignments = listCoursesClass.value.map((course, index) => ({
    course_class_id: course.course_class_id,
    course_id: course.course_id,
    teacher_id: selectedTeachers.value[index],
  }));

  // Filtrar solo las asignaciones donde se seleccionó un profesor
  const validAssignments = assignments.filter(
    (assignment) => assignment.teacher_id !== '' && assignment.teacher_id != null
  );

  if (validAssignments.length > 0) {
    try {
      await CourseClassService.saveAssignmentTeachers(validAssignments);
      showToast("Asignaciones guardadas con éxito.", "success");
    } catch (error) {
      showToast("Error al guardar las asignaciones.", "danger");
    }
  } else {
    showToast("No se han seleccionado asignaciones válidas.", "warning");
  }
};

onMounted(listItems);
</script>

<style scoped>
.listCourses-wrapper {
  margin: 0 auto;
  max-width: min(100%, 50rem);
  padding: var(--rp-space-5) 0 var(--rp-space-8);
}

.listCourses-wrapper h1 {
  font-size: var(--rp-text-2xl);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  letter-spacing: -0.02em;
  color: var(--rp-text-heading);
  margin: 0 0 var(--rp-space-5);
  padding-bottom: var(--rp-space-4);
  border-bottom: 1px solid var(--rp-border);
}

.listCourses-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
  gap: var(--rp-space-4);
}

.course-item {
  display: flex;
  flex-direction: column;
  background-color: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  box-shadow: var(--rp-shadow-xs);
  padding: var(--rp-space-4);
}

.course-info h3 {
  margin: 0;
  font-size: var(--rp-text-md);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-snug);
  overflow-wrap: break-word;
}

.professor-select {
  margin-top: var(--rp-space-3);
  width: 100%;
}

.styled-select {
  width: 100%;
  max-width: 100%;
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-base);
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  background-color: var(--rp-surface);
  color: var(--rp-text);
  outline: none;
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.styled-select:focus {
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.button-container {
  margin-top: var(--rp-space-6);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--rp-space-2);
}

.styled-button {
  padding: var(--rp-space-2) var(--rp-space-5);
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
  border: 1px solid var(--rp-brand-500);
  border-radius: var(--rp-radius-md);
  background-color: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.styled-button:hover {
  background-color: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

.styled-button:focus-visible {
  outline: none;
  box-shadow: var(--rp-shadow-focus);
}

/* El segundo botón ("Regresar") es la acción secundaria y comparte clase. */
.button-container .styled-button + .styled-button {
  background-color: var(--rp-surface);
  border-color: var(--rp-border-strong);
  color: var(--rp-text);
}

.button-container .styled-button + .styled-button:hover {
  background-color: var(--rp-surface-sunken);
}

.toast-bottom-right {
  position: fixed;
  bottom: var(--rp-space-5);
  right: var(--rp-space-5);
  z-index: var(--rp-z-banner);
}

@media (max-width: 767.98px) {
  .listCourses-wrapper h1 {
    font-size: var(--rp-text-xl);
  }
}

@media (max-width: 575.98px) {
  .button-container > .styled-button {
    flex: 1 1 auto;
  }

  .toast-bottom-right {
    left: var(--rp-space-3);
    right: var(--rp-space-3);
    bottom: var(--rp-space-3);
  }
}
</style>

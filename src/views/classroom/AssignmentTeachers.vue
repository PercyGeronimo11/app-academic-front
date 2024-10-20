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
    (assignment) => assignment.professorId !== ""
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
  text-align: center;
  margin: 0 auto;
  max-width: 800px;
}

.listCourses-container {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  justify-content: center;
}

.course-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f4f8;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.professor-select {
  margin-top: 10px;
  width: 100%;
}

.styled-select {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 2px solid #1e3a5f;
  border-radius: 5px;
  background-color: #f9f9f9;
  color: #1e3a5f;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.styled-select:focus {
  border-color: #27496d;
  box-shadow: 0 0 8px rgba(39, 73, 109, 0.5);
}

.button-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.styled-button {
  background-color: #1e3a5f;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, transform 0.3s;
}

.styled-button:hover {
  background-color: #27496d;
  transform: scale(1.05);
}

.styled-button:active {
  background-color: #16293b;
}

.styled-button:focus {
  outline: none;
}

.toast-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}
</style>

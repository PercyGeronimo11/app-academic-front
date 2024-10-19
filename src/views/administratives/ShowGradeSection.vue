<template>
  <div class="listCourses-wrapper">
  <h1>Lista de Cursos de </h1>
    <div v-if="listCourses.length" class="listCourses-container">
      <div v-for="(course, index) in listCourses" :key="course.id" class="course-item">
        <div class="course-info">
          <h3>{{ course.course_name }}</h3>
        </div>
        <div class="professor-select">
          <select v-model="selectedTeachers[index]" class="select-professor">
            <option value="">Seleccionar profesor</option>
            <option v-for="professor in listTeachers" :key="professor.id" :value="professor.id">
              {{ professor.name }} {{ professor.surname_mother }} {{ professor.surname_father }}
            </option>
          </select>
        </div>
      </div>
      <button @click="saveAssignments" class="save-button">Guardar Asignaciones</button>
    </div>
    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseClassService from "@/services/CourseClassService";
import TeacherService from "@/services/TeacherService";
import GradeSectionService from "@/services/GradeSectionService";
import {useRoute} from "vue-router";

const route=useRoute();
const listCourses = ref([]); 
const listTeachers = ref([]); 
const selectedTeachers = ref([]); 
const gradeSectionData=ref(null);

const listItems = async () => {
  const id = route.params.id; 
  try {
    const coursesResponse = await CourseClassService.listCoursesByIdGradeSection(id);
    listCourses.value = coursesResponse.data.data;

    const listTeachersResponse = await TeacherService.getItems();
    listTeachers.value = listTeachersResponse.data.data;

    selectedTeachers.value = new Array(listCourses.value.length).fill("");

    const response = await GradeSectionService.getGradeSection(id);
    gradeSectionData.value=response.data.data;

  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};


const saveAssignments = () => {
  const assignments = listCourses.value.map((course, index) => ({
    courseId: course.id,
    professorId: selectedTeachers.value[index],
  }));

  // Filtrar solo las asignaciones donde se seleccionó un profesor
  const validAssignments = assignments.filter(assignment => assignment.professorId !== "");

  if (validAssignments.length > 0) {
    console.log("Asignaciones a guardar:", validAssignments);
    // Aquí puedes llamar a un servicio para guardar las asignaciones en la base de datos
  } else {
    alert("Por favor, selecciona un profesor para al menos un curso.");
  }
};

// Cargar los cursos y profesores al montar el componente
onMounted(listItems);
</script>

<style scoped>
.listCourses-wrapper {
  padding: 20px;
}

.listCourses-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.course-info {
  flex: 1;
}

.professor-select {
  flex: 1;
}

.select-professor {
  width: 100%;
  padding: 5px;
}

.save-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  font-size: 1.25rem;
  color: #555;
}
</style>

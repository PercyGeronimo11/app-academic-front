<template>
<div class="listCourses-wrapper">
    <h1>Asignación de profesores</h1>
    <div v-if="listCoursesClass.length" class="listCourses-container">
      <div v-for="(course, index) in listCoursesClass" :key="course.course_class_id" class="course-item">
        <div class="course-info">
          <h3>{{ course.course_name }}</h3>
        </div>
        <div class="professor-select">
          <select v-model="selectedTeachers[index]" class="select-professor">
            <option v-if="!course.teacher_name" value="">Seleccionar profesor</option>
            <option v-if="course.teacher_name" :value="course.teacher_id">
              {{ course.teacher_name }}
            </option>
            <option v-for="professor in listTeachers" :key="professor.id" :value="professor.id" >
              {{ professor.name }} {{ professor.surname_mother }} {{ professor.surname_father }}
            </option>
          </select>
        </div>
      </div>
      <button @click="saveAssignments" class="save-button">Guardar Asignaciones</button>
      <button @click="backToAulas" class="back-button">Regresar a Aulas</button>
    </div>
    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseClassService from "@/services/CourseClassService";
import TeacherService from "@/services/TeacherService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const listCoursesClass = ref([]); 
const listTeachers = ref([]); 
const selectedTeachers = ref([]); 

// Función para listar cursos y profesores
const listItems = async () => {
  const id = route.params.id; 
  try {
    const coursesResponse = await CourseClassService.listCoursesByIdGradeSection(id);
    listCoursesClass.value = coursesResponse.data.data;

    const listTeachersResponse = await TeacherService.getItems();
    listTeachers.value = listTeachersResponse.data.data;

    selectedTeachers.value = new Array(listCoursesClass.value.length).fill("");
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
};

// Función para volver a la lista de aulas
const backToAulas = () => {
  router.push(`/classroom/list`);
};

// Función para guardar asignaciones
const saveAssignments = async () => {
  const assignments = listCoursesClass.value.map((course, index) => ({
    course_class_id: course.course_class_id,
    course_id: course.course_id,
    teacher_id: selectedTeachers.value[index],
  }));

  // Filtrar solo las asignaciones donde se seleccionó un profesor
  const validAssignments = assignments.filter(assignment => assignment.professorId !== "");

  if (validAssignments.length > 0) {
    try {
      // Llama a tu servicio para guardar las asignaciones
      await CourseClassService.saveAssignmentTeachers(validAssignments);

      alert("Asignaciones guardadas con éxito.");
    } catch (error) {
      console.error("Error al guardar las asignaciones:", error);
      alert("Hubo un error al guardar las asignaciones.");
    }
  } else {
    alert("Por favor, selecciona un profesor para al menos un curso.");
  }
};

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

.back-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #18232f5d;
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

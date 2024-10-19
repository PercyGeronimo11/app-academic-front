<template>
  <div>
    <div class="select-row">
      <div class="select-container">
        <label for="grades">Selecciona el grado:</label>
        <div class="select-wrapper" id="grades">
          <VueSelect
            v-model="selectedGrade"
            :options="optionsGrades"
            placeholder="Selecciona una opción"
          />
        </div>
      </div>
      <div class="select-container">
        <label for="course-select">Elige curso:</label>
        <div class="select-wrapper">
          <VueSelect
            v-model="selectedCourse"
            :options="options"
            placeholder="Selecciona una opción"
          />
          <button @click="addCourse" class="add-button">Agregar</button>
        </div>
      </div>
    </div>

    <!-- Tabla de alumnos seleccionados -->
    <div class="selected-box">
      <div v-if="selectedCourses.length > 0">
        <table class="courses-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(course, index) in selectedCourses" :key="index">
              <td data-label="Nombre">{{ course.name }}</td>
              <td data-label="Acciones">
                <span class="close-icon" @click="removeCourse(index)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.59 8L14 10.41L10.41 14L8 11.59L5.59 14L2 10.41L4.41 8L2 5.59L5.59 2L8 4.41L10.41 2L14 5.59L11.59 8Z"
                      fill="red"
                    />
                  </svg>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-message">No hay elementos seleccionados.</p>
    </div>

    <div class="select-container">
      <button @click="submitToCreate" class="submit" @change="submitToCreate">Guardar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseService from "@/services/CourseService";
import CourseClassService from "@/services/CourseClassService";
import GradeSectionService from "@/services/GradeSectionService";
import VueSelect from "vue3-select-component";
import Swal from "sweetalert2";

const selectedCourse = ref(null);
const selectedCourses = ref([]);
const selectedCoursesIds = ref([]);
const options = ref([]);
const courses = ref([]); 
const grades = ref([]);
const optionsGrades = ref([]);
const selectedGrade = ref(null);

onMounted(async () => {
  try {
    await listGrades();
    await loadCourses();
  } catch (error) {
    console.error(error);
  }
});

// Agregar estudiante seleccionado a la lista
const addCourse = () => {
  if (selectedCourse.value) {
    const courseToAdd = courses.value.find(
      (course) => course.id === selectedCourse.value
    );

    // Solo agregar si el curso no está ya en la lista
    if ( courseToAdd && !selectedCourses.value.some((course) => course.id === courseToAdd.id)
    ) {
      selectedCourses.value.push(courseToAdd); 
      selectedCoursesIds.value.push(courseToAdd.id );
    }
  }
  selectedCourse.value = null; // Limpiar la selección después de agregar
};


const removeCourse = (index) => {
  selectedCourses.value.splice(index, 1);
};

const listGrades = async () => {
  const response = await GradeSectionService.getGrades();
  grades.value = response.data.data;

  optionsGrades.value = grades.value.map((grade) => ({
    label: grade.name, 
    value: grade.id, 
  }));
};


const loadCourses = async () => {
  const response = await CourseService.getItems();
  courses.value = response.data.data;

  options.value = courses.value.map((course) => ({
    label: `${course.name}`, 
    value: course.id, 
  }));
};

const clearData = () => {
  selectedGrade.value = 0;
  selectedCoursesIds.value = null;
};

const submitToCreate = async () => {
  var data = {
    grade_id: selectedGrade.value, 
    period_id: 1, 
    coursesIds: selectedCoursesIds.value,
  };

  try {
    console.log("entro al")
    await CourseClassService.assignmentCourse(data);
    clearData();
    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "Administrativo registrado con éxito.",
    });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};
</script>

<style scoped>
/* Layout general */
.select-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.select-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.select-wrapper {
  margin-top: 5px;
  display: flex;
  align-items: center;
}

/* Botones */
.add-button,
.submit {
  margin-left: 10px;
  padding: 8px 12px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button {
  background-color: #007bff;
}

.add-button:hover {
  background-color: #0056b3;
}

.submit {
  margin-top: 20px;
  background-color: #00be20;
}

.submit:hover {
  background-color: #00862f;
}

/* Caja de elementos seleccionados */
.selected-box {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.empty-message {
  text-align: center;
  color: #ccc;
  font-style: italic;
}

/* Tabla */
.courses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.courses-table th,
.courses-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.courses-table thead {
  background-color: #f2f2f2;
}

@media (max-width: 768px) {
  .courses-table {
    border: 0;
  }

  .courses-table thead {
    display: none;
  }

  .courses-table tr {
    display: block;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  .courses-table td {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border: 0;
    border-bottom: 1px solid #ddd;
  }

  .courses-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 10px;
  }

  .courses-table td:last-child {
    border-bottom: 0;
  }
}

/* Icono de cerrar */
.close-icon {
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

.close-icon:hover {
  transform: scale(1.1);
}
</style>

<template>
  <div>
    <div class="select-row">
      <div class="select-container">
        <label for="grades">Selecciona el grado:</label>
        <div class="select-wrapper" id="grades">
          <VueSelect
            v-model="id_grade_selected"
            :options="optionsGrades"
            placeholder="Selecciona una opción"
          />
        </div>
      </div>
      <div class="select-container">
        <label for="course-select">Elige curso:</label>
        <div class="select-wrapper">
          <VueSelect
            v-model="id_course_selected"
            :options="optionsCourses"
            placeholder="Selecciona una opción"
          />
          <button @click="addCourse" class="add-button">Agregar</button>
        </div>
      </div>
    </div>

    <!-- Tabla de cursos seleccionados -->
    <div class="selected-box">
      <div v-if="coursesSelecteds.length > 0">
        <table class="courses-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(course, index) in coursesSelecteds" :key="index">
              <td data-label="Nombre">{{ course.label }}</td>
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

    <div class="select-container-footer">
      <div class="button-group">
        <button @click="submitToCreate" class="submit-button">
          <i class="fas fa-save"></i> Guardar
        </button>
        <button @click="backToAulas" class="back-button">
          <i class="fas fa-arrow-left"></i> Volver
        </button>
      </div>
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
import { ref, onMounted, watch } from "vue";
import CourseService from "@/services/CourseService";
import CourseClassService from "@/services/CourseClassService";
import GradeSectionService from "@/services/GradeSectionService";
import VueSelect from "vue3-select-component";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router=useRouter();
const coursesSelecteds = ref([]);
const optionsCourses = ref([]);
const optionsGrades = ref([]);
const id_course_selected = ref(null);
const id_grade_selected = ref(null);
const toast = ref({
  visible: false,
  message: "",
  color: "primary",
});

onMounted(async () => {
  try {
    await listGradesAndCourses();
  } catch (error) {
    console.error(error);
  }
});

// Agregar curso seleccionado a la lista
const addCourse = () => {
  if (id_course_selected.value) {
    const courseToAdd = optionsCourses.value.find(
      (course) => course.value === id_course_selected.value
    );

    // Verificar si el curso ya está en la lista
    if (
      courseToAdd &&
      !coursesSelecteds.value.some((course) => course.value === courseToAdd.value)
    ) {
      coursesSelecteds.value.push(courseToAdd);
    } else {
      showToast("Curso ya a sido agregado", "warning");
    }
  }
  id_course_selected.value = null; // Limpiar la selección después de agregar
};

// Eliminar curso de la lista
const removeCourse = (index) => {
  coursesSelecteds.value.splice(index, 1);
};

// Cargar grados y cursos disponibles
const listGradesAndCourses = async () => {
  const response1 = await GradeSectionService.getGrades();
  const listGrades = ref(response1.data.data);

  optionsGrades.value = listGrades.value.map((grade) => ({
    label: grade.name,
    value: grade.id,
  }));

  const response2 = await CourseService.getItems();
  const listCourses = ref(response2.data.data);

  optionsCourses.value = listCourses.value.map((course) => ({
    label: `${course.name}`,
    value: course.id,
  }));
};

// Cargar cursos asignados al cambiar el grado seleccionado
watch(id_grade_selected, async (newId) => {
  if (newId) {
    try {
      const response3 = await CourseClassService.listCoursesByIdGrade(newId);
      const listCoursesAssignments = ref(response3.data.data);
      coursesSelecteds.value = listCoursesAssignments.value.map((course) => ({
        label: `${course.course_name}`,
        value: course.course_id,
      }));
    } catch (error) {
      showToast("Error al obtener los cursos", "danger");
    }
  }
});

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

const backToAulas = () => {
  router.push(`/classroom/list`);
};

const submitToCreate = async () => {
  if (!id_grade_selected.value) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, selecciona un grado antes de guardar.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  if (coursesSelecteds.value.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Sin cursos",
      text: "Debes agregar al menos un curso.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  try {
    // Obtener los IDs de los cursos seleccionados
    const selectedCourseIds = coursesSelecteds.value.map((course) => course.value);

    // Crear objeto para enviar al servidor
    const payload = {
      grade_id: id_grade_selected.value,
      course_ids: selectedCourseIds,
    };

    const response = await CourseClassService.assignmentCourse(payload);

    showToast("Cursos guardados con éxito", "success");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Ocurrió un error al guardar los cursos. Inténtalo nuevamente.",
      confirmButtonText: "Aceptar",
    });
    console.error("Error al guardar los cursos:", error);
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

.select-container-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
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
.toast-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1050;
}

.button-group {
  display: flex;
  gap: 15px;
}

.submit-button,
.back-button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Estilos específicos para cada botón */
.submit-button {
  background-color: #4CAF50; /* Verde */
  color: white;
}

.submit-button:hover {
  background-color: #45A049;
}

.back-button {
  background-color: #f44336; /* Rojo */
  color: white;
}

.back-button:hover {
  background-color: #da190b;
}
</style>

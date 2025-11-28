<template>
  <div class="assignment-container">
    <!-- ENCABEZADO -->
    <h2 class="title">Asignación de Cursos por Grado</h2>

    <!-- SELECTORES -->
    <div class="selectors">
      <div class="field">
        <label>Selecciona el grado:</label>
        <VueSelect
          v-model="id_grade_selected"
          :options="optionsGrades"
          placeholder="Selecciona un grado"
        />
      </div>

      <div class="field">
        <label>Elige un curso:</label>
        <div class="inline-group">
          <VueSelect
            v-model="id_course_selected"
            :options="optionsCourses"
            placeholder="Selecciona un curso"
          />
          <button @click="addCourse" class="btn-add">Agregar</button>
        </div>
      </div>
    </div>

    <!-- TABLA -->
    <div class="table-section">
      <h3>Cursos asignados</h3>

      <div v-if="coursesSelecteds.length > 0" class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Nombre del Curso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(course, index) in coursesSelecteds" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ course.label }}</td>
              <td>
                <button class="btn-delete" @click="removeCourse(index)">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-message">Aún no hay cursos asignados.</p>
    </div>

    <!-- BOTONES FINALES -->
    <div class="footer-buttons">
      <button class="btn-save" @click="submitToCreate">
        <i class="fas fa-save"></i> Guardar cambios
      </button>
      <button class="btn-back" @click="backToAulas">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>

    <!-- TOAST -->
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
import { ref, onMounted, watch } from "vue";
import CourseService from "@/services/CourseService";
import CourseClassService from "@/services/CourseClassService";
import GradeSectionService from "@/services/GradeSectionService";
import VueSelect from "vue3-select-component";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
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
  await listGradesAndCourses();
});

const addCourse = () => {
  if (id_course_selected.value) {
    const courseToAdd = optionsCourses.value.find(
      (course) => course.value === id_course_selected.value
    );
    if (
      courseToAdd &&
      !coursesSelecteds.value.some((c) => c.value === courseToAdd.value)
    ) {
      coursesSelecteds.value.push(courseToAdd);
    } else {
      showToast("El curso ya fue agregado", "warning");
    }
  }
  id_course_selected.value = null;
};

const removeCourse = (index) => {
  coursesSelecteds.value.splice(index, 1);
};

const listGradesAndCourses = async () => {
  const response1 = await GradeSectionService.getGrades();
  optionsGrades.value = response1.data.data.map((g) => ({
    label: g.name,
    value: g.id,
  }));

  const response2 = await CourseService.getItems();
  optionsCourses.value = response2.data.data.map((c) => ({
    label: c.name,
    value: c.id,
  }));
};

watch(id_grade_selected, async (newId) => {
  if (newId) {
    const response = await CourseClassService.listCoursesByIdGrade(newId);
    coursesSelecteds.value = response.data.data.map((c) => ({
      label: c.course_name,
      value: c.course_id,
    }));
  }
});

const showToast = (message, color) => {
  toast.value = { message, color, visible: true };
  setTimeout(() => (toast.value.visible = false), 3000);
};

const backToAulas = () => router.push(`/classroom/list`);
const submitToCreate = async () => { /* tu lógica actual */ };
</script>

<style scoped>
.assignment-container {
  max-width: 950px;
  margin: 40px auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  font-family: 'Poppins', sans-serif;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 35px;
  position: relative;
}
.title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background-color: #007bff;
  margin: 10px auto 0;
  border-radius: 2px;
}

.selectors {
  display: flex;
  gap: 25px;
  margin-bottom: 40px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}
label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.inline-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-add {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 500;
}
.btn-add:hover {
  background-color: #0056b3;
}

/* Sección de tabla */
.table-section {
  background: #fdfdfd;
  border: 1px solid #e6e6e6;
  border-radius: 14px;
  padding: 25px;
  margin-bottom: 30px;
  text-align: center;
}
.table-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
}

/* Tabla moderna */
.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
}
.styled-table thead {
  background-color: #f7f9fc;
  border-bottom: 2px solid #e3e6ea;
}
.styled-table th,
.styled-table td {
  padding: 12px 15px;
  text-align: center;
  color: #333;
}
.styled-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}
.styled-table tbody tr:hover {
  background-color: #f1f7ff;
  transition: 0.3s;
}

.btn-delete {
  background-color: #dc3545;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 500;
}
.btn-delete:hover {
  background-color: #b02a37;
}

/* Botones inferiores */
.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.btn-save,
.btn-back {
  border: none;
  padding: 12px 26px;
  border-radius: 10px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-save {
  background-color: #28a745;
}
.btn-save:hover {
  background-color: #218838;
}
.btn-back {
  background-color: #6c757d;
}
.btn-back:hover {
  background-color: #5a6268;
}

.empty-message {
  margin-top: 15px;
  font-style: italic;
  opacity: 0.85;
  color: #555;
}

.toast-bottom-right {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>

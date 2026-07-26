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
  max-width: min(100%, 60rem);
  margin: var(--rp-space-6) auto;
  padding: var(--rp-space-6);
  background-color: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  box-shadow: var(--rp-shadow-xs);
}

.title {
  font-size: var(--rp-text-2xl);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  letter-spacing: -0.02em;
  color: var(--rp-text-heading);
  margin: 0 0 var(--rp-space-6);
  padding-bottom: var(--rp-space-4);
  border-bottom: 1px solid var(--rp-border);
}

.selectors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rp-space-4);
  margin-bottom: var(--rp-space-6);
}

.field {
  flex: 1 1 min(100%, 16rem);
  min-width: 0;
  display: flex;
  flex-direction: column;
}

label {
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-medium);
  margin-bottom: var(--rp-space-1);
  color: var(--rp-text-muted);
}

.inline-group {
  display: flex;
  gap: var(--rp-space-2);
  align-items: center;
  min-width: 0;
}

/* El select ocupa el espacio libre y el botón conserva su tamaño natural. */
.inline-group > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}

.btn-add,
.btn-delete,
.btn-save,
.btn-back {
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
  border: 1px solid transparent;
  border-radius: var(--rp-radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.btn-add {
  flex-shrink: 0;
  padding: var(--rp-space-2) var(--rp-space-4);
  background-color: var(--rp-brand-500);
  border-color: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
}

.btn-add:hover {
  background-color: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

/* Sección de tabla */
.table-section {
  background: var(--rp-surface-muted);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  padding: var(--rp-space-5);
  margin-bottom: var(--rp-space-6);
}

.table-section h3 {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  margin: 0 0 var(--rp-space-4);
}

.table-container {
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.styled-table {
  width: 100%;
  min-width: 20rem;
  border-collapse: collapse;
}

.styled-table thead th {
  background-color: var(--rp-table-head-bg);
  color: var(--rp-table-head-color);
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--rp-tracking-wide);
  white-space: nowrap;
  border-bottom: 1px solid var(--rp-table-head-border);
}

.styled-table th,
.styled-table td {
  padding: var(--rp-space-3);
  text-align: center;
  font-size: var(--rp-text-base);
  color: var(--rp-text);
  border-bottom: 1px solid var(--rp-table-row-border);
}

.styled-table tbody tr {
  transition: background-color var(--rp-transition-fast);
}

.styled-table tbody tr:hover {
  background-color: var(--rp-table-row-hover);
}

.styled-table tbody tr:last-child td {
  border-bottom: none;
}

.btn-delete {
  padding: var(--rp-space-1) var(--rp-space-3);
  font-size: var(--rp-text-sm);
  background-color: var(--rp-danger-50);
  border-color: var(--rp-danger-200);
  color: var(--rp-danger-700);
}

.btn-delete:hover {
  background-color: var(--rp-danger-100);
  border-color: var(--rp-danger-500);
}

/* Botones inferiores */
.footer-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--rp-space-2);
  margin-top: var(--rp-space-5);
}

.btn-save,
.btn-back {
  padding: var(--rp-space-2) var(--rp-space-5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rp-space-2);
}

.btn-save {
  background-color: var(--rp-brand-500);
  border-color: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
}

.btn-save:hover {
  background-color: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

.btn-back {
  background-color: var(--rp-surface);
  border-color: var(--rp-border-strong);
  color: var(--rp-text);
}

.btn-back:hover {
  background-color: var(--rp-surface-sunken);
}

.empty-message {
  margin: 0;
  text-align: center;
  font-size: var(--rp-text-base);
  color: var(--rp-text-muted);
}

.toast-bottom-right {
  position: fixed;
  bottom: var(--rp-space-5);
  right: var(--rp-space-5);
  z-index: var(--rp-z-banner);
}

@media (max-width: 767.98px) {
  .assignment-container {
    margin: var(--rp-space-4) auto;
    padding: var(--rp-space-4);
  }

  .title {
    font-size: var(--rp-text-xl);
  }

  .table-section {
    padding: var(--rp-space-3);
  }
}

@media (max-width: 575.98px) {
  .footer-buttons > button {
    flex: 1 1 auto;
  }

  .toast-bottom-right {
    left: var(--rp-space-3);
    right: var(--rp-space-3);
    bottom: var(--rp-space-3);
  }
}
</style>

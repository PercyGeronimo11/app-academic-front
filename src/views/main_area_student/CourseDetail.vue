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
      </div>
    </div>

    <div v-for="(unit, index) in units" :key="index">
      <h2 @click="toggleUnitVisibility(index)" class="unit-title">
        Unidad {{ index + 1 }}
        <i :class="unit.isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </h2>

      <CButton
        class="mb-3 text-white btn-report"
        color="info"
        @click="generateReportScore(course_class_id, index + 1)"
        v-if="ConfirmRole()"
      >
        <b>Reporte de notas</b>
      </CButton>

      <CRow v-if="unit && unit.isVisible" class="mb-3">
        <div v-for="item in unit.items" :key="item.id">
          <!-- Mostrar solo si el tipo es 'TAREA' -->
          <TaskDetail
            v-if="item.type === 'TAREA'"
            :title="'TAREA: ' + item.title"
            :description="item.description"
            :id="item.id"
            @delete="deleteTask(item.id)"
            @score="scoreTask(item.id)"
          />
          <!-- Mostrar solo si el tipo es 'MATERIAL' -->
          <MaterialDetail
            v-if="item.type === 'MATERIAL' && item.path_file"
            :title="item.title"
            :path-file="item.path_file"
          />
        </div>
      </CRow>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CryptoJS from "crypto-js";
import { useRoute, useRouter } from "vue-router";
import TaskService from "@/services/TaskService";
import MaterialService from "@/services/MaterialService";
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
const taskData = ref([]);
const listMaterials = ref([]);


const units = ref([
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
]);

const courseClassData = ref({
  course_name: "",
  teacher_name: "",
});


// --------------------------------METODOS--------------------------


const getCourseClassData = async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id);
    courseClassData.value = response.data.data;
    console.log("dataaa:",courseClassData);
  } catch (error) {
    console.error("Error al cargar datos del curso:", error);
  }
};


const fetchListTasks = async () => {
  const response = await TaskService.getItems(course_class_id);
  taskData.value = response.data.data;
  units.value = [
    { isVisible: false, items: [] },
    { isVisible: false, items: [] },
    { isVisible: false, items: [] },
    { isVisible: false, items: [] },
  ];
  response.data.data.forEach((task) => {
    const unitIndex = task.unit_id - 1;
    task.type = "TAREA";
    units.value[unitIndex].items.push(task);
  });
};

function toggleUnitVisibility(index) {
  units.value[index].isVisible = !units.value[index].isVisible;
}

function toggleGeneralVisibility() {
  isvisibleGeneral.value = !isvisibleGeneral.value;
}

const ConfirmRole = () => {
  return decryptedRole == "Profesor";
};


const fetchListMaterials = async () => {
  try {
    const response = await MaterialService.getItems(course_class_id);
    listMaterials.value = response.data.data;

    listMaterials.value.forEach((material) => {
      const unitIndex = material.unit_id - 1; // Ajusta el índice (si unit_id empieza en 1)
      if (units.value[unitIndex]) {
        material.type = "MATERIAL";
        units.value[unitIndex].items.push(material);
      }
    });
    console.log("listaaa: ", units.value);
  } catch (error) {
    console.error("Error al obtener los materiales:", error);
  }
};


const scoreTask = (id) => {
  router.push(`/assingNotes/${course_class_id}/${id}`);
};

const generateReportScore = (course_class_id, idUnit) => {
  router.push({
    name: "StudentScores",
    params: {
      course_class_id: course_class_id,
      unit_id: idUnit,
    },
  });
};
onMounted(() => {
  fetchListTasks();
  fetchListMaterials();
  getCourseClassData();
});

</script>

<style scoped>
.course-title {
  color: #034285;
  text-align: center;
  margin-bottom: 1.5em;
  transition: color 0.3s;
}

.unit-title,
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

.unit-title:hover,
.general-title:hover {
  color: #004094;
}

i {
  margin-left: 10px;
}

.no-underline {
  text-decoration: none;
  color: inherit;
}
</style>

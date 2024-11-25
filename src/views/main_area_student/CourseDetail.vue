<template>
  <div class="course-section">
    <h1 class="course-title">Curso de {{ courseClassData.course_name }}</h1>
    
    <!-- General Section -->
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
            <CCard class="mb-4 p-3 card-custom">
              <div class="section-header">
                <router-link
                  :to="`/student/courseClass/${course_class_id}/assistance`"
                  class="no-underline"
                >
                  <strong>Ver asistencias</strong>
                </router-link>
              </div>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>

    <!-- listTaskAndMaterial Section -->
    <div v-for="(unit, index) in listTaskAndMaterial" :key="index">
      <h2 @click="toggleUnitVisibility(index)" class="unit-title">
        Unidad {{ index + 1 }}
        <i :class="unit.isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </h2>

      <!-- Tareas y Materiales -->
      <CRow v-if="unit.isVisible" class="mb-3">
        <div v-for="item in unit.items" :key="item.id">
          <TaskDetail
            v-if="item.type === 'TAREA'"
            :title="'TAREA: ' + item.title"
            :description="item.description"
            :id="item.id"
            :score="item.score"
            @delete="deleteTask(item.id)"
            @score="scoreTask(item.id)"
          />
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
import MaterialDetail from "./../main_area_teacher/MaterialDetail.vue";
import TaskDetail from "./../main_area_student/TaskDetail.vue";
import { useRoute, useRouter } from "vue-router";
import TaskService from "@/services/TaskService";
import MaterialService from "@/services/MaterialService";
import CourseClassService from "@/services/CourseClassService";

const route = useRoute();
const router = useRouter();

const course_class_id = Number(route.params.courseClass);
const isvisibleGeneral = ref(false);
const courseClassData = ref({ course_name: "", teacher_name: "" });


const listTaskAndMaterial = ref([
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
]);

onMounted(() => {
  fetchListTasks();
  fetchListMaterials();
  getCourseClassData();
});


const fetchListTasks = async () => {
  try {
    const response = await TaskService.getItemsByStudentAndClass(course_class_id);
    response.data.data.forEach((task) => {
      const unitIndex = task.unit_id - 1; 
      if (listTaskAndMaterial.value[unitIndex]) {
        task.type = "TAREA"; 
        listTaskAndMaterial.value[unitIndex].items.push(task);
      }
    });
    console.log("tasksss:", listTaskAndMaterial.value);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
  }
};

const fetchListMaterials = async () => {
  try {
    const response = await MaterialService.getItems(course_class_id);
    response.data.data.forEach((material) => {
      const unitIndex = material.unit_id - 1;
      if (listTaskAndMaterial.value[unitIndex]) {
        material.type = "MATERIAL"; 
        listTaskAndMaterial.value[unitIndex].items.push(material);
      }
    });
    console.log("materialaaa:", listTaskAndMaterial.value);
  } catch (error) {
    console.error("Error al obtener materiales:", error);
  }
};

const getCourseClassData = async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id);
    courseClassData.value = response.data.data;
  } catch (error) {
    console.error("Error al obtener datos del curso:", error);
  }
};

const toggleUnitVisibility = (index) => {
  listTaskAndMaterial.value[index].isVisible = !listTaskAndMaterial.value[index].isVisible;
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

<template>
  <div class="course-section">
    <h1 class="course-title">CURSO DE MATEMÁTICA</h1>
    <CDropdown class="mb-3 me-2" v-if="ConfirmRole()">
      <CDropdownToggle color="primary">CREAR NUEVO(A)</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#" @click="openModal">Tarea</CDropdownItem>
        <CDropdownItem href="#">Material</CDropdownItem>
        <CDropdownItem href="#">Aviso</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
    <CButton class="mb-3" color="warning" v-if="ConfirmRole()"><b>Reporte general de notas</b></CButton>
    
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
                <router-link :to="`/teacher/${course_class_id }/horary`" class="no-underline">
                  <strong>Crear un horario</strong>
                </router-link>
              </div>
              <div class="section-header">
                <router-link :to="`/teacher/${course_class_id }/assistance-dates`" class="no-underline">
                  <strong>Tomar asistencia</strong>
                </router-link>
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
      <CButton class="mb-3 text-white btn-report" color="info" @click="generateReportScore(course_class_id , index + 1)" v-if="ConfirmRole()">
        <b>Reporte de notas</b>
      </CButton>
      <CRow v-if="unit.isVisible" class="mb-3">
        <div v-for="item in unit.items" :key="item.id">
          <SectionDetail
            :title="item.type == 'TAREA' ? 'TAREA: ' + item.title : item.title"
            :description="item.description"
            :id="item.id"
            @delete="item.type == 'TAREA' ? deleteTask(item.id) : null"
            @score="item.type == 'TAREA' ? scoreTask(item.id) : null"
          />
        </div>
      </CRow>
    </div>
    
    <!-- Modal para crear nueva tarea -->
    <CModal :visible="isModalOpen" scrollable size="lg" @close="() => { isModalOpen = false }" aria-labelledby="LiveDemoExampleLabel" alignment="center">
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Nueva tarea</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="title">Título *</CFormLabel>
                <CFormInput type="text" id="title" v-model="formData.title" placeholder="Escriba el título" />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="description">Descripción</CFormLabel>
                <CFormTextarea id="description" rows="3" v-model="formData.description"></CFormTextarea>
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="due_date">Fecha de entrega</CFormLabel>
                <CFormInput type="date" id="due_date" v-model="formData.due_date" />
              </CCol>
              <CCol>
                <CFormLabel for="unit_id">Unidad</CFormLabel>
                <CFormSelect id="unit_id" aria-label="Floating label select example" v-model="formData.unit_id">
                  <option value="0">Seleccione una unidad</option>
                  <option value="1">Unidad 1</option>
                  <option value="2">Unidad 2</option>
                  <option value="3">Unidad 3</option>
                  <option value="4">Unidad 4</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CContainer>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeModal">Cancelar</CButton>
        <CButton color="primary" @click="submitToCreate()">Registrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SectionDetail from "../main_area_teacher/SectionDetail.vue";
import CryptoJS from "crypto-js";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import TaskService from "@/services/TaskService";

const route = useRoute();
const router = useRouter();

const role_key = localStorage.getItem("r_key") || "guest";
const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
const decryptedRole = CryptoJS.AES.decrypt(role_key, secretKey).toString(CryptoJS.enc.Utf8);

const course_class_id = Number(route.params.courseClass);
const isvisibleGeneral = ref(false);
const taskData = ref([]);
const isModalOpen = ref(false);
const units = ref([
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
  { isVisible: false, items: [] },
]);

const formData = ref({
  title: "",
  description: "",
  due_date: "",
  unit_id: "",
  course_class_id: "",
  period_id: 1,
});

onMounted(() => {
  formData.value.due_date = getPeruvianDate();
  listTasks();
});

const getPeruvianDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() / 60;
  const peruOffset = -5;
  date.setHours(date.getHours() - offset + peruOffset);
  return date.toISOString().split("T")[0];
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

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const listTasks = async () => {
  const data = {
    course_id: course_class_id ,
  }
  const response = await TaskService.getItems(data);
  taskData.value = response.data.data;
  response.data.data.forEach((task) => {
    const unitIndex = task.unit_id - 1;
    task.type = "TAREA";
    units.value[unitIndex].items.push(task);
  });
};

const submitToCreate = async () => {
  formData.value.course_class_id = course_class_id ;
  if (validateForm()) {
    try {
      await TaskService.createItem(formData.value);
      closeModal();
      listTasks();
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tarea registrada con éxito.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: error.response?.data?.message || "Error desconocido",
      });
    }
  } else {
    Swal.fire({
      icon: "warning",
      title: "Error",
      text: "Complete todos los campos obligatorios.",
    });
  }
};

const deleteTask = async (id) => {
  try {
    await TaskService.deleteItem(id);
    for (const unit of units.value) {
      const index = unit.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        unit.items.splice(index, 1);
        break;
      }
    }
    Swal.fire({
      icon: "success",
      title: "Eliminación exitosa",
      text: "Tarea eliminada con éxito.",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al Eliminar",
      text: error.response?.data?.message || "Error desconocido",
    });
  }
};

const scoreTask = (id) => {
  router.push(`/assingNotes/${course_class_id }/${id}`);
};

const generateReportScore = (course_class_id , idUnit) => {
  router.push({
    name: "StudentScores",
    params: {
      course_class_id: course_class_id ,
      unit_id: idUnit,
    },
  });
};

const validateForm = () => {
  const { title, due_date, unit_id } = formData.value;
  return title && due_date && unit_id;
};
</script>

<style scoped>
.course-title {
  color: #034285;
  text-align: center;
  margin-bottom: 1.5em;
  transition: color 0.3s;
}

.unit-title, .general-title {
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

.unit-title:hover, .general-title:hover {
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

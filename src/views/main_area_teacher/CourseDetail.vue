<template>
  <div class="course-section">
    <h1 class="course-title">Curso de {{ courseClassData.course_name }}</h1>
    <CDropdown class="mb-3 me-2" v-if="ConfirmRole()">
      <CDropdownToggle color="primary">CREAR NUEVO(A)</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#" @click="openModal(true)">Tarea</CDropdownItem>
        <CDropdownItem href="#" @click="openModalMaterial(true)">Material</CDropdownItem>
        <CDropdownItem href="#">Aviso</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
    <CButton class="mb-3" color="warning" v-if="ConfirmRole()" @click="ReportAssistence">
      <b>Reporte general de asistencia</b>
    </CButton>
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
                  :to="`/teacher/${course_class_id}/horary`"
                  class="no-underline"
                >
                  <strong>Crear un horario</strong>
                </router-link>
              </div>
              <div class="section-header">
                <router-link
                  :to="`/teacher/${course_class_id}/assistance-dates`"
                  class="no-underline"
                >
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

      <CButton
        class="mb-3 text-white btn-report"
        color="info"
        @click="generateReportScore(course_class_id, index + 1)"
        v-if="ConfirmRole() && unit.isVisible"
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

    <!-- Modal para crear nueva tarea -->
    <CModal
      :visible="isModalOpen"
      scrollable
      size="lg"
      @close="openModal(false)"
      aria-labelledby="LiveDemoExampleLabel"
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Nueva tarea</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="title">Título *</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  v-model="formData.title"
                  placeholder="Escriba el título"
                />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="description">Descripción *</CFormLabel>
                <CFormTextarea
                  id="description"
                  rows="3"
                  v-model="formData.description"
                ></CFormTextarea>
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="due_date">Fecha de entrega</CFormLabel>
                <CFormInput type="date" id="due_date" v-model="formData.due_date" />
              </CCol>
              <CCol>
                <CFormLabel for="unit_id">Unidad</CFormLabel>
                <CFormSelect
                  id="unit_id"
                  aria-label="Floating label select example"
                  v-model="formData.unit_id"
                >
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
        <CButton color="secondary" @click="openModal(false)">Cancelar</CButton>
        <CButton color="primary" @click="submitToCreate()">Registrar</CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal para subir un material -->
    <CModal
      :visible="isModalOpenMaterial"
      scrollable
      size="lg"
      @close="openModal(false)"
      aria-labelledby="LiveDemoExampleLabel"
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Nuevo material educativo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="title">Título</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  v-model="materialData.title"
                  placeholder="Escriba el título"
                />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="unit_id">Unidad</CFormLabel>
                <CFormSelect
                  id="unit_id"
                  aria-label="Floating label select example"
                  v-model="materialData.unit_id"
                >
                  <option value="">Seleccione una unidad</option>
                  <option value="1">Unidad 1</option>
                  <option value="2">Unidad 2</option>
                  <option value="3">Unidad 3</option>
                  <option value="4">Unidad 4</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="file">Archivo PDF</CFormLabel>
                <input
                  type="file"
                  accept="application/pdf"
                  id="file"
                  @change="handleFileChange"
                />
              </CCol>
            </CRow>
          </CContainer>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="openModalMaterial(false)">Cancelar</CButton>
        <CButton color="primary" @click="submitToCreateMaterial">Guardar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MaterialDetail from "./MaterialDetail.vue";
import TaskDetail from "./TaskDetail.vue";
import CryptoJS from "crypto-js";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
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
const isModalOpen = ref(false);
const isModalOpenMaterial = ref(false);

const materialData = ref({
  title: "",
  unit_id: "",
  course_class_id: course_class_id,
  period_id: 1,
});
const listMaterials = ref([]);
const pdfFile = ref(null);

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

const formData = ref({
  title: "",
  description: "",
  due_date: "",
  unit_id: "",
  course_class_id: "",
  period_id: 1,
});

var assistenceData = ref([]);

var assistenceData = ref([]);

// --------------------------------METODOS--------------------------
onMounted(() => {
  formData.value.due_date = getPeruvianDate();
  fetchListTasks();
  fetchListMaterials();
  getCourseClassData();
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

const openModal = (decision) => {
  isModalOpen.value = decision;
};

const openModalMaterial = (decision) => {
  isModalOpenMaterial.value = decision;
};

const handleFileChange = (event) => {
  pdfFile.value = event.target.files[0];
};

const getCourseClassData = async () => {
  try {
    const response = await CourseClassService.getCourseClass(course_class_id);
    courseClassData.value = response.data.data;
    console.log("dataaa:", courseClassData);
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

const submitToCreate = async () => {
  formData.value.course_class_id = course_class_id;
  if (validateForm()) {
    try {
      await TaskService.createItem(formData.value);
      openModal(false);
      fetchListTasks();
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

const submitToCreateMaterial = async () => {
  if (!materialData.value.title || !materialData.value.unit_id) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }

  if (!pdfFile.value) {
    alert("Selecciona un archivo PDF antes de guardar.");
    return;
  }

  const formData = new FormData();
  formData.append("title", materialData.value.title);
  formData.append("unit_id", materialData.value.unit_id);
  formData.append("course_class_id", materialData.value.course_class_id);
  formData.append("period_id", materialData.value.period_id);
  formData.append("pdf", pdfFile.value);

  try {
    const response = await MaterialService.createItem(formData);
    alert("Material educativo creado con éxito.");
    closeModal();
  } catch (error) {
    console.error("Error al guardar el material:", error);
    alert("Hubo un error al guardar el material.");
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

const validateForm = () => {
  const { title, due_date, unit_id } = formData.value;
  return title && due_date && unit_id;
};

const ReportAssistence = async () => {
  router.push({
    name: "StudentAssistence",
    params: {
      course_class_id: course_class_id,
    },
  });
};
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

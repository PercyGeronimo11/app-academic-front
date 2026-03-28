<template>
  <div>
    <CardComponent title="Lista de Alumnos" style="margin: 20px 10px;">
      <TramiteListShell>
        <template #toolbar>
          <div class="box-tools">
            <CRow class="mb-3">
              <CCol>
                <CInputGroup>
                  <CFormInput v-model="searchData" placeholder="Buscar por apellido, nombre o DNI"
                    aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2" />
                  <CButton type="button" color="primary" id="button-addon2" @click="listAdministrativeService(searchData)">Buscar</CButton>
                </CInputGroup>
              </CCol>
              <CCol></CCol>
              <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
                <CButton color="info text-white" @click="openImportStudentsModal">Importar Estudiantes</CButton>
              </CCol>
            </CRow>
          </div>
        </template>
      <ElegantCrudList :columns="listColumns" :data="alumnos">
        <template #actions="{ item }">
          <CButton color="warning" class="text-white" @click="navigateToEditStudent(item.id)">
                <CIcon :content="cilPencil" size="lg"></CIcon>
              </CButton>
              <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
                <CIcon :content="cilTrash" size="lg"></CIcon>
              </CButton>
        </template>
      </ElegantCrudList>
      </TramiteListShell>
    </CardComponent>
  </div>

  <ImportStudents
    v-model:isOpenModal="isOpenModalImportStudents"
    @updateData="listStudentService"
  />
</template>

<script setup>
import StudentService from '@/services/StudentService'
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import ImportStudents from './ImportStudents.vue';
import CardComponent from '@/components/cruds/CardComponent.vue';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import TramiteListShell from '@/components/paperworks/TramiteListShell.vue';
import { cilPencil, cilTrash } from '@coreui/icons';

const isOpenModalImportStudents = ref(false);
const alumnos = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const router = useRouter();
const listColumns = ref([
  { key: 'id', label: 'N°'},
  { key: 'name', label: 'Nombre y Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'representative_phone', label: 'Numero de Celular' },
  { key: 'actions', label: 'OPCIONES' }, // El key 'actions' activa el slot
]);
const alumnoData = ref({
  name: '',
  surname_father: '',
  surname_mother: '',
  grade_current:"",
  birth_date: '',
  dni: '',
  age:"",
  address: '',
  sex: '',
  representative_dni: '',
  representative_name: '',
  representative_phone: '',
  representative_relationship: '',
  email: '',
  password: '',
});

onMounted(async () => {
  try {
    await listStudentService();
  } catch (error) {
    console.error(error);
  }
});

const openImportStudentsModal = () => {
  isOpenModalImportStudents.value = true;
};

const listStudentService = async () => {
  const response = await StudentService.getItems();
  alumnos.value = response.data.data;
}

const navigateToEditStudent = async (id) => {
  return router.push({
    name: 'editStudent',
    params: { id }
  });
};

const clearDataModal = () => {
  alumnoData.value = {
    name: '',
    surname_father: '',
    surname_mother: '',
    birth_date: '',
    dni: '',
    sex: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    academic_degree: ''
  };
};

const closeModal = () => {
  isModalOpen.value = false;
  clearDataModal();
};

const calculateAge = () => {
  if (!alumnoData.value.birth_date) return;

  const birthDate = new Date(alumnoData.value.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  alumnoData.value.age = age;
};


const deleteItem = async (id) => {
  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: '#E55353',
      title: 'Eliminar Alumno',
      text: '¿Estás seguro que desea eliminar este alumno?',
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#E55353',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#39F',
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await StudentService.deleteItem(id);
      listStudentService();
      Swal.fire({
        icon: 'success',
        title: 'Alumno eliminado',
        text: 'El alumno ha sido eliminado exitosamente.',
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Alumno. Por favor, inténtalo de nuevo.',
    });
  }
};

watch(searchData, (newVal) => {
  listStudentService(newVal);
});
</script>

<style>
.input-group-text {
  background-color: #f0f0f0;
  border-left: none;
  font-weight: bold;
}

.form-control {
  border-right: none;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  border-radius: 0.25rem 0 0 0.25rem;
}

.input-group .input-group-text {
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>
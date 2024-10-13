<template>
  <div>
    <div class="mb-2">
      <h1>Lista de Alumnos</h1>
      <CRow class="mb-3">
        <CCol>
          <CInputGroup>
            <CFormInput v-model="searchData" placeholder="Buscar por apellido, nombre o DNI"
              aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2" />
            <CButton type="button" color="primary" id="button-addon2" >Buscar</CButton>
          </CInputGroup>
        </CCol>
        <CCol></CCol>
        <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
            <router-link to="/new-student" class="CButton" >
            <CButton color="info text-white" >Nuevo</CButton>
            </router-link>
        </CCol>
      </CRow>
    </div>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            #
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Nombres y apellidos
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            DNI
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            N° celular
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Acciones
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="item in alumnos" :key="item.name">
          <CTableDataCell>
            <div class="text-center">{{ item.id }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.name }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.dni }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.representative_phone }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <CButton color="warning" shape="rounded-pill" class="text-white" @click="navigateToEditStudent(item.id)">Editar
              </CButton>
              <CButton color="danger" shape="rounded-pill" class="text-white" @click="deleteItem(item.id)">Eliminar
              </CButton>
            </div>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import StudentService from '@/services/StudentService'
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'

const alumnos = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const router = useRouter();
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
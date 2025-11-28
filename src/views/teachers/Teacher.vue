<template>
  <div>
    <CardComponent title="Lista de Docentes" style="margin: 20px 10px;">
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
            <CButton color="info text-white" @click="openCreateModal()">Nuevo</CButton>
          </CCol>
        </CRow>
      </div>
      <ElegantCrudList :columns="listColumns" :data="teachers">
        <template #actions="{ item }">
          <CButton color="warning" class="text-white" @click="openEditModal(item.id)">
                <CIcon :content="cilPencil" size="lg"></CIcon>
              </CButton>
              <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
                <CIcon :content="cilTrash" size="lg"></CIcon>
              </CButton>
        </template>
      </ElegantCrudList>
    </CardComponent>

    <!-- Modal para Crear/Editar Profesor -->
    <CModal :visible="isModalOpen" scrollable size="lg" @close="() => { isModalOpen = false }"
      aria-labelledby="LiveDemoExampleLabel" alignment="center">
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">
          {{ isEditMode ? 'Editar Profesor' : 'Crear Profesor' }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="isEditMode ? updateUser() : submitToCreate()">
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="teacherData.dni" label="DNI" placeholder="Documento de identidad" required />
              </CCol>
              <CCol>
                <CFormInput v-model="teacherData.name" label="Nombres" placeholder="Nombre" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="teacherData.surname_father" label="Apellido paterno" placeholder="Nombre"
                  required />
              </CCol>
              <CCol>
                <CFormInput v-model="teacherData.surname_mother" label="Apellido materno" placeholder="Apellido materno"
                  required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="teacherData.address" label="Dirección" placeholder="Dirección" required />
              </CCol>
              <CCol>
                <CFormInput v-model="teacherData.academic_degree" label="Titulo academico"
                  placeholder="Titulo academico" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="email">Email</CFormLabel>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="nombre" v-model="teacherData.email"
                    @input="updateEmail" required />
                  <span class="input-group-text">@ierp.edu.pe</span> <!-- Parte fija con el dominio -->
                </div>
              </CCol>
              <CCol>
                <CFormInput v-model="teacherData.password" label="Contraseña" placeholder="password" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="teacherData.birth_date" label="Fecha de nacimiento" type="date" required />
              </CCol>
              <CCol>
                <CFormLabel for="exampleFormControlInput1">Sexo</CFormLabel>
                <CFormSelect aria-label="Default select example" v-model="teacherData.sex">
                  <option disabled value=0>Seleccionar una opción</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </CFormSelect>
              </CCol>
              <CCol>
                <CFormInput v-model="teacherData.phone" label="N° de teléfono" placeholder="N° de teléfono" required />
              </CCol>
            </CRow>
          </CContainer>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="() => { closeModal() }">
          Cancelar
        </CButton>
        <CButton color="primary" @click="isEditMode ? submitToEdit() : submitToCreate()">
          {{ isEditMode ? 'Actualizar' : 'Registrar' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import TeacherService from '@/services/TeacherService'
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import CardComponent from '@/components/cruds/CardComponent.vue';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import { cilPencil, cilTrash } from '@coreui/icons';

const teachers = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const listColumns = ref([
  { key: 'id', label: 'N°'},
  { key: 'name', label: 'Nombre y Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'phone', label: 'Numero de Celular' },
  { key: 'actions', label: 'OPCIONES' }, // El key 'actions' activa el slot
]);
const teacherData = ref({
  name: '',
  surname_father: '',
  surname_mother: '',
  birth_date: '',
  dni: '',
  sex: 'M',
  phone: '',
  email: '',
  password: '',
  address: '',
  academic_degree: ''
});


onMounted(async () => {
  try {
    await listTeacherService();
  } catch (error) {
    console.error(error);
  }
});

const listTeacherService = async (data) => {
  console.log(data);
  const response = await TeacherService.getItems(data);
  teachers.value = response.data.data;
}

const openCreateModal = () => {
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openEditModal = async (id) => {
  const response = await TeacherService.getItem(id);
  idItemSelected.value = response.data.data.id;
  teacherData.value = { ...response.data.data };
  isEditMode.value = true;
  isModalOpen.value = true;
};

const clearDataModal = () => {
  teacherData.value = {
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
  if (!teacherData.value.birth_date) return;

  const birthDate = new Date(teacherData.value.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  teacherData.value.age = age;
};


const submitToCreate = async () => {
  try {
    calculateAge();
    await TeacherService.createItem(teacherData.value);
    listTeacherService();
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Docente registrado con éxito.',
    });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: error.response.data.message[0],
      });
    } else {
      console.log("error:" + error);
    }
  }
};

const submitToEdit = async () => {
  teacherData.value.id = idItemSelected.value;
  try {
    calculateAge();
    await TeacherService.updateItem(teacherData.value);
    listTeacherService();
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: 'Docente actualizado con éxito.',
    });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: error.response.data.message[0],
      });
    } else {
      console.log("error:" + error);
    }
  }
};

const deleteItem = async (id) => {
  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: '#E55353',
      title: 'Eliminar Docente',
      text: '¿Estás seguro que desea eliminar este docente?',
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#E55353',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#39F',
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await TeacherService.deleteItem(id);
      listTeacherService();
      Swal.fire({
        icon: 'success',
        title: 'Docente eliminado',
        text: 'El docente ha sido eliminado exitosamente.',
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Docente. Por favor, inténtalo de nuevo.',
    });
  }
};

watch(searchData, (newVal) => {
  listTeacherService(newVal);
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
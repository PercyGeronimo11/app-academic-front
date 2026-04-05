<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <div class="mb-3">
              <h4 class="fw-bold text-primary mb-0 d-flex align-items-center">
                <i class="fas fa-user-tie me-2"></i>
                Lista de administrativos
              </h4>
            </div>
            <CRow class="g-2 align-items-end">
              <CCol xs="12" md>
                <CInputGroup>
                  <CFormInput
                    v-model="searchData"
                    placeholder="Buscar por apellido, nombre o DNI"
                    aria-label="Buscar por apellido, nombre o DNI"
                    aria-describedby="button-addon2"
                  />
                  <CButton
                    type="button"
                    color="primary"
                    id="button-addon2"
                    @click="listAdministrativeService(searchData)"
                  >
                    Buscar
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol xs="12" md="auto" class="d-flex flex-wrap gap-2 justify-content-md-end">
                <ImportDataModal descripcion="Alumnos" />
                <CButton color="info" class="text-white" @click="openCreateModal()">Nuevo</CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="list-with-pagination-wrap">
              <ElegantCrudList
                :columns="listColumns"
                :data="teachers"
                empty-message="No hay administrativos para mostrar."
                empty-hint="Prueba otra búsqueda o usa «Nuevo» para registrar un administrativo."
                empty-icon="👔"
              >
              <template #actions="{ item }">
                <div class="d-flex gap-2">
                  <CButton color="warning" class="text-white" @click="openEditModal(item.id)">
                    <CIcon :content="cilPencil" size="lg"></CIcon>
                  </CButton>
                  <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
                    <CIcon :content="cilTrash" size="lg"></CIcon>
                  </CButton>
                </div>
              </template>
            </ElegantCrudList>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

    <!-- Modal para Crear/Editar Profesor -->
    <CModal :visible="isModalOpen" scrollable size="lg" @close="() => { isModalOpen = false }"
      aria-labelledby="LiveDemoExampleLabel" alignment="center">
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">
          {{ isEditMode ? 'Editar Administrativo' : 'Crear Administrativo' }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="isEditMode ? updateUser() : submitToCreate()">
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="administrativeData.names" label="Nombres *" placeholder="Nombre" required />
              </CCol>
              <CCol>
                <CFormInput v-model="administrativeData.surname_father" label="Apellido Paterno *" placeholder="Apellido Paterno"
                  required />
              </CCol>
              <CCol>
                <CFormInput v-model="administrativeData.surname_mother" label="Apellido Materno *" placeholder="Apellido Materno"
                  required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="administrativeData.dni" label="DNI *" placeholder="Documento de identidad" type="number" required @input="limitDniLength"/>
              </CCol>
              <CCol>
                <CFormInput v-model="administrativeData.birth_date" label="Fecha de nacimiento *" type="date" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="administrativeData.address" label="Dirección" placeholder="Dirección" required />
              </CCol>
              <CCol>
                <CFormInput v-model="administrativeData.phone_number" label="N° de teléfono" placeholder="N° de teléfono" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormLabel for="email">Email *</CFormLabel>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Correo electrónico" v-model="administrativeData.email"
                    @input="updateEmail" required />
                  <span class="input-group-text">@ierp.edu.pe</span>
                </div>
              </CCol>
              <CCol>
                <CFormInput v-model="administrativeData.password" label="Contraseña" placeholder="Contraseña" required />
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
</template>

<script setup>
import AdministrativeService from '@/services/AdministrativeService'
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import { cilPencil, cilTrash } from '@coreui/icons';
import ElegantCrudList from '../../components/cruds/ElegantCrudList.vue';
import ImportDataModal from '@/components/modals/ImportDataModal.vue';

const listColumns = ref([
  { key: 'id', label: 'N°'},
  { key: 'names', label: 'Nombre y Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'phone_number', label: 'Numero de Celular' },
  { key: 'rol.name', label: 'Rol' },
  { key: 'actions', label: 'OPCIONES' }, // El key 'actions' activa el slot
]);

const teachers = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const administrativeData = ref({
  names: '',
  surname_father: '',
  surname_mother: '',
  birth_date: '',
  dni: '',
  phone_number: '',
  address: '',
  email: '',
  password: '',
});


onMounted(async () => {
  try {
    await listAdministrativeService();
  } catch (error) {
    console.error(error);
  }
});

const listAdministrativeService = async (data) => {
  const response = await AdministrativeService.getItems(data);
  teachers.value = response.data.data;
}

const openCreateModal = () => {
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openEditModal = async (id) => {
  const response = await AdministrativeService.getItem(id);
  idItemSelected.value = response.data.data.id;
  administrativeData.value = { ...response.data.data };
  administrativeData.value.email = response.data.data.user.email.replace('@ierp.edu.pe', '');
  isEditMode.value = true;
  isModalOpen.value = true;
};

const clearDataModal = () => {
  administrativeData.value = {
    name: '',
    surname_father: '',
    surname_mother: '',
    birth_date: '',
    dni: '',
    phone_number: '',
    address: '',
    email: '',
    password: '',
  };
};

const closeModal = () => {
  isModalOpen.value = false;
  clearDataModal();
};

const submitToCreate = async () => {
  if(validateForm()){
    try {
        await AdministrativeService.createItem(administrativeData.value);
        listAdministrativeService();        
        closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Administrativo registrado con éxito.',
        });
      
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: error.response.data.message,
        });
      } else {
        console.log("error:" + error);
      }
    }
  }else{
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: 'Complete todos los campos obligatorios.',
    });
  }
};

const submitToEdit = async () => {
  if(validateForm()){
    administrativeData.value.id = idItemSelected.value;
    var data;
    if(administrativeData.value.password==''){
      const { password, ...rest } = administrativeData.value;
      data = rest;
    }else
      data = administrativeData.value
    try {
      await AdministrativeService.updateItem(data);
      listAdministrativeService();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'Administrativo actualizado con éxito.',
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
  }else{
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: 'Complete todos los campos obligatorios.',
    });
  }
};

const deleteItem = async (id) => {
  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: '#E55353',
      title: 'Eliminar Administrativo',
      text: '¿Estás seguro que desea eliminar este administrativo?',
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#E55353',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#39F',
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await AdministrativeService.deleteItem(id);
      listAdministrativeService();
      Swal.fire({
        icon: 'success',
        title: 'Administrativo eliminado',
        text: 'El administrativo ha sido eliminado exitosamente.',
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el administrativo. Por favor, inténtalo de nuevo.',
    });
  }
};

const limitDniLength = async(event) => {
  const dni = event.target.value;

  if (dni.length > 8) {
    event.target.value = dni.substring(0, 8);
  }
};

const validateForm = () => {
  if(administrativeData.value.names=='' || administrativeData.value.surname_father=='' || administrativeData.value.surname_mother=='' || administrativeData.value.dni=='' || administrativeData.value.birth_date=='' || administrativeData.value.email==''){
    return false;
  }else{
    return true;
  }
}

watch(searchData, (newVal) => {
  listAdministrativeService(newVal);
});
</script>

<style>
.input-group-text {
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

.box-tools{
  height: 100%;
  padding: 10px 10px;
}

.box-tools {
  height: 100%;
  padding: 15px 20px;
  margin-bottom: 15px;
}
</style>
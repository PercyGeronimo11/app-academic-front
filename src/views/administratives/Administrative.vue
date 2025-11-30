<template>
  <div>
    <CardComponent title="Lista de Administrativos" style="margin: 20px 10px;">
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
      <!-- <CTable align="middle" class="mb-0 border" hover responsive>
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
          <CTableRow v-for="item in teachers" :key="item.name">
            <CTableDataCell>
              <div class="text-center">{{ item.id }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.names+' '+item.surnames }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.dni }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.phone_number != null ? item.phone_number : '---' }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                <CButton color="warning" class="text-white" @click="openEditModal(item.id)">
                  <CIcon :content="cilPencil" size="lg"></CIcon>
                </CButton>
                <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
                  <CIcon :content="cilTrash" size="lg"></CIcon>
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable> -->
    </CardComponent>

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
                <CFormInput v-model="administrativeData.surnames" label="Apellidos *" placeholder="Apellidos"
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
  </div>
</template>

<script setup>
import AdministrativeService from '@/services/AdministrativeService'
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import CardComponent from '../../components/cruds/CardComponent.vue';
import { cilPencil, cilTrash } from '@coreui/icons';
import ElegantCrudList from '../../components/cruds/ElegantCrudList.vue';

const listColumns = ref([
  { key: 'id', label: 'N°'},
  { key: 'names', label: 'Nombre y Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'phone_number', label: 'Numero de Celular' },
  { key: 'actions', label: 'OPCIONES' }, // El key 'actions' activa el slot
]);

const teachers = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const administrativeData = ref({
  names: '',
  surnames: '',
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
    surnames: '',
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
  if(administrativeData.value.names=='' || administrativeData.value.surnames=='' || administrativeData.value.dni=='' || administrativeData.value.birth_date=='' || administrativeData.value.email==''){
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
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
}
</style>
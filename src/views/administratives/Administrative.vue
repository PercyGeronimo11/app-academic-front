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
            <CRow class="mb-3 gy-3">
              <CCol :xs="12" :md="4">
                <CFormInput v-model="administrativeData.names" label="Nombres *" placeholder="Nombre" required />
              </CCol>
              <CCol :xs="12" :md="4">
                <CFormInput v-model="administrativeData.surname_father" label="Apellido Paterno *" placeholder="Apellido Paterno"
                  required />
              </CCol>
              <CCol :xs="12" :md="4">
                <CFormInput v-model="administrativeData.surname_mother" label="Apellido Materno *" placeholder="Apellido Materno"
                  required />
              </CCol>
            </CRow>
            <CRow class="mb-3 gy-3">
              <CCol :xs="12" :md="4">
                <CFormSelect v-model="administrativeData.role_id" label="Rol *" required>
                  <option value="">Seleccione un rol</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                </CFormSelect>
              </CCol>
              <CCol :xs="12" :md="4">
                <CFormInput v-model="administrativeData.dni" label="DNI" placeholder="Documento de identidad" type="number" @input="limitDniLength"/>
              </CCol>
              <CCol :xs="12" :md="4">
                <CFormInput v-model="administrativeData.birth_date" label="Fecha de nacimiento *" type="date" required />
              </CCol>
            </CRow>
            <CRow class="mb-3 gy-3">
              <CCol :xs="12" :md="6">
                <CFormInput v-model="administrativeData.address" label="Dirección" placeholder="Dirección" />
              </CCol>
              <CCol :xs="12" :md="6">
                <CFormInput v-model="administrativeData.phone_number" label="N° de teléfono" placeholder="N° de teléfono" />
              </CCol>
            </CRow>
            <CRow class="mb-3 gy-3">
              <CCol :xs="12" :md="6">
                <CFormLabel for="email">Email *</CFormLabel>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Correo electrónico" v-model="administrativeData.email"
                    @input="updateEmail" required />
                  <span class="input-group-text">@ierp.edu.pe</span>
                </div>
              </CCol>
              <CCol :xs="12" :md="6">
                <CFormInput v-model="administrativeData.password" :label="isPasswordRequired ? 'Contraseña *' : 'Contraseña'"
                  placeholder="Contraseña" :required="isPasswordRequired" />
                <small v-if="isPasswordRequired" class="text-body-secondary">
                  Sin DNI la contraseña no se puede generar sola, indíquela aquí.
                </small>
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
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'
import { cilPencil, cilTrash } from '@coreui/icons';
import ElegantCrudList from '../../components/cruds/ElegantCrudList.vue';

const listColumns = ref([
  { key: 'id', label: 'N°'},
  { key: 'names', label: 'Nombre y Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'phone_number', label: 'Numero de Celular' },
  { key: 'rol.name', label: 'Rol' },
  { key: 'actions', label: 'OPCIONES' }, // El key 'actions' activa el slot
]);

const teachers = ref([]);
const roles = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
var idItemSelected = ref(0);
var searchData = ref('');
const administrativeData = ref(emptyAdministrative());

function emptyAdministrative() {
  return {
    names: '',
    surname_father: '',
    surname_mother: '',
    birth_date: '',
    role_id: '',
    dni: '',
    phone_number: '',
    address: '',
    email: '',
    password: '',
  };
}

// Al crear sin DNI el backend no puede derivar la contraseña, así que debe venir escrita.
const isPasswordRequired = computed(
  () => !isEditMode.value && !String(administrativeData.value.dni || '').trim()
);

onMounted(async () => {
  try {
    await Promise.all([listAdministrativeService(), listRoles()]);
  } catch (error) {
    console.error(error);
  }
});

const listRoles = async () => {
  const response = await AdministrativeService.getRoles();
  roles.value = response.data.data;
};

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
  administrativeData.value = { ...emptyAdministrative(), ...response.data.data };
  administrativeData.value.email = response.data.data.user.email.replace('@ierp.edu.pe', '');
  administrativeData.value.role_id = response.data.data.user.role_id ?? '';
  administrativeData.value.password = '';
  isEditMode.value = true;
  isModalOpen.value = true;
};

const clearDataModal = () => {
  administrativeData.value = emptyAdministrative();
};

const closeModal = () => {
  isModalOpen.value = false;
  clearDataModal();
};

const submitToCreate = async () => {
  const falta = missingFieldsMessage();
  if (falta) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: falta });
    return;
  }

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
};

const submitToEdit = async () => {
  const falta = missingFieldsMessage();
  if (falta) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: falta });
    return;
  }

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
    const mensaje = error.response?.data?.message;
    if (mensaje) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: Array.isArray(mensaje) ? mensaje[0] : mensaje,
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

const missingFieldsMessage = () => {
  const d = administrativeData.value;
  const vacio = (valor) => !String(valor ?? '').trim();

  if (vacio(d.names) || vacio(d.surname_father) || vacio(d.surname_mother)
    || vacio(d.birth_date) || vacio(d.email)) {
    return 'Complete todos los campos obligatorios.';
  }

  if (vacio(d.role_id)) {
    return 'Seleccione el rol del administrativo.';
  }

  // El DNI es opcional porque no siempre se conoce al dar de alta.
  if (isPasswordRequired.value && vacio(d.password)) {
    return 'Sin DNI debe indicar una contraseña para el usuario.';
  }

  return null;
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
<template>
  <div>
    <div class="mb-2">
      <h1>Lista de Docentes</h1>
      <CRow class="mb-3">  
        <CCol>
          <CInputGroup>
            <CFormInput v-model="searchData" placeholder="Buscar por apellido, nombre o DNI" aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2"/>
            <CButton type="button" color="primary" id="button-addon2" @click="ListItem(searchData)">Buscar</CButton>
          </CInputGroup>
        </CCol>
        <CCol></CCol>
        <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
          <CButton color="info text-white" @click="openCreateModal()">Nuevo</CButton>
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
        <CTableRow v-for="item in items" :key="item.name">
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
            <div class="text-center">{{ item.phone }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <CButton color="warning" shape="rounded-pill" class="text-white" @click="openEditModal(item.id)">Editar</CButton>
              <CButton color="danger" shape="rounded-pill" class="text-white" @click="deleteItem(item.id)">Eliminar</CButton>
            </div>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
    
    <!-- Modal para Crear/Editar Usuario -->
    <CModal 
      :visible="isModalOpen"
      scrollable
      size="lg"
      @close="() => { isModalOpen = false }"
      aria-labelledby="LiveDemoExampleLabel"
      alignment="center"
    >
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">
          {{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="isEditMode ? updateUser() : submitToCreate()">
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="itemData.dni" label="DNI" placeholder="Documento de identidad" required />
              </CCol>
              <CCol>
                <CFormInput v-model="itemData.name" label="Nombres" placeholder="Nombre" required />
              </CCol>
              
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="itemData.surname_father" label="Apellido paterno" placeholder="Nombre" required />
              </CCol>
              <CCol>
                <CFormInput v-model="itemData.surname_mother" label="Apellido materno" placeholder="Apellido materno" required />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="itemData.birth_date" label="Fecha de nacimiento" type="date" required />
              </CCol>
              <CCol>
                <CFormLabel for="exampleFormControlInput1">Sexo</CFormLabel>
                <CFormSelect aria-label="Default select example" v-model="itemData.sex">
                  <option disabled value=0>Seleccionar una opción</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </CFormSelect>
              </CCol>
              <CCol>
                <CFormInput v-model="itemData.phone" label="N° de teléfono" placeholder="N° de teléfono" required />
              </CCol>
            </CRow>
          </CContainer>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="() => {closeModal()}">
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
  const items = ref([]);
  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  var idItemSelected = ref(0);
  var searchData = ref('');
  const itemData = ref({
    name:'',
    surname_father:'',
    surname_mother:'',
    birth_date:'',
    dni:'',
    sex:'M',
    phone:''
  });

  onMounted(async () => {
    try {
      await ListItem();
    } catch (error) {
      console.error(error);
    }
  });

  const ListItem = async (data) => {
    console.log(data);
    
    const response = await TeacherService.getItems(data);
    items.value = response.data.data;
  }

  const openCreateModal = () => {
    isEditMode.value = false;
    isModalOpen.value = true;
  };

  const openEditModal = async (id) => {
    const response = await TeacherService.getItem(id);
    idItemSelected.value = response.data.data.id;
    itemData.value = { ...response.data.data };
    isEditMode.value = true;
    isModalOpen.value = true;
  };

  const clearDataModal = () => {
    itemData.value = {
      name:'',
      surname_father:'',
      surname_mother:'',
      birth_date:'',
      dni:'',
      sex:'',
      phone:''
    };
  };

  const closeModal = () => {
    isModalOpen.value = false;
    clearDataModal();
  };

  const calculateAge = () => {
    if (!itemData.value.birth_date) return;

    const birthDate = new Date(itemData.value.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Si el mes actual es menor que el mes de nacimiento, o es el mismo mes pero el día es anterior, resta un año
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Guardamos la edad calculada en itemData
    itemData.value.age = age;
  };

  const submitToCreate = async () => {
    try {
      calculateAge();
      await TeacherService.createItem(itemData.value);
      ListItem();
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

  const submitToEdit = async ()  => {
    itemData.value.id = idItemSelected.value;
    try {
      calculateAge();
      await TeacherService.updateItem(itemData.value);
      ListItem();
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
        ListItem();
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
    ListItem(newVal);
  });
</script>

<style>

</style>
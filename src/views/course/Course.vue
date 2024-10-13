<template>
  <div>
    <div class="mb-2">
      <h1>Lista de Cursos</h1>
      <CRow class="mb-3">  
        <CCol>
          <CInputGroup>
            <CFormInput v-model="searchData" placeholder="Buscar por nombre" aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2"/>
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
            Nombres
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Descripcion
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
            <div class="text-center">{{ item.description }}</div>
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
    
    <!-- Modal para Crear/Editar curso -->
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
          {{ isEditMode ? 'Editar curso' : 'Crear curso' }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="isEditMode ? updateUser() : submitToCreate()">
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="itemData.name" label="Nombre" placeholder="nombre..." required />
              </CCol>
              <CCol>
                <CFormInput v-model="itemData.description" label="Descripcion" placeholder="descripcion..." required />
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
  import CourseService from '@/services/CourseService'
  import { ref, onMounted, watch } from 'vue';
  import Swal from 'sweetalert2'
  const items = ref([]);
  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  var idItemSelected = ref(0);
  var searchData = ref('');
  const itemData = ref({
    name:'',
    description:'',
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
    const response = await CourseService.getItems(data);
    items.value = response.data.data;
  }

  const openCreateModal = () => {
    isEditMode.value = false;
    isModalOpen.value = true;
  };

  const openEditModal = async (id) => {
    const response = await CourseService.getItem(id);
    idItemSelected.value = response.data.data.id;
    itemData.value = { ...response.data.data };
    isEditMode.value = true;
    isModalOpen.value = true;
  };

  const clearDataModal = () => {
    itemData.value = {
      name:'',
      description:'',
    };
  };

  const closeModal = () => {
    isModalOpen.value = false;
    clearDataModal();
  };

  const submitToCreate = async () => {
    try {
      await CourseService.createItem(itemData.value);
      ListItem();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Curso registrado con éxito.',
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
      await CourseService.updateItem(itemData.value);
      ListItem();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'Curso actualizado con éxito.',
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
        title: 'Eliminar Curso',
        text: '¿Estás seguro que desea eliminar este curso?',
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#E55353',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#39F',
        reverseButtons: true,
      });
      if (confirmResult.isConfirmed) {
        await CourseService.deleteItem(id);
        ListItem();
        Swal.fire({
          icon: 'success',
          title: 'Curso eliminado',
          text: 'El curso ha sido eliminado exitosamente.',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al eliminar el Curso. Por favor, inténtalo de nuevo.',
      });
    }
  };

  watch(searchData, (newVal) => {
    ListItem(newVal);
  });
</script>

<style>

</style>
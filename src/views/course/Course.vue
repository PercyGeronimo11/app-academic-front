<template>
  <div :class="{ 'course-embedded': embedded }">
    <CardComponent v-if="!embedded" title="Lista de Cursos" style="margin: 20px 10px;">
      <div class="box-tools">
        <CRow class="mb-3">
          <CCol>
            <CInputGroup>
              <CFormInput
                v-model="searchData"
                placeholder="Buscar por nombre"
                aria-label="Buscar por nombre"
                aria-describedby="button-addon2"
              />
              <CButton type="button" color="primary" id="button-addon2" @click="ListItem(searchData)">
                Buscar
              </CButton>
            </CInputGroup>
          </CCol>
          <CCol></CCol>
          <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
            <CButton color="info text-white" @click="openCreateModal()">Nuevo</CButton>
          </CCol>
        </CRow>
      </div>
      <ElegantCrudList :columns="listColumns" :data="items">
        <template #image="{ item }">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="course-thumb"
          />
          <span v-else class="course-thumb-placeholder">{{ (item.name || '?').charAt(0) }}</span>
        </template>
        <template #actions="{ item }">
          <CButton color="warning" class="text-white" @click="openEditModal(item.id)">
            <CIcon :content="cilPencil" size="lg" />
          </CButton>
          <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
            <CIcon :content="cilTrash" size="lg" />
          </CButton>
        </template>
      </ElegantCrudList>
    </CardComponent>

    <template v-else>
      <div class="box-tools">
        <CRow class="mb-3">
          <CCol>
            <CInputGroup>
              <CFormInput
                v-model="searchData"
                placeholder="Buscar por nombre"
                aria-label="Buscar por nombre"
                aria-describedby="button-addon2"
              />
              <CButton type="button" color="primary" id="button-addon2" @click="ListItem(searchData)">
                Buscar
              </CButton>
            </CInputGroup>
          </CCol>
          <CCol></CCol>
          <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
            <CButton color="info text-white" @click="openCreateModal()">Nuevo</CButton>
          </CCol>
        </CRow>
      </div>
      <ElegantCrudList :columns="listColumns" :data="items">
        <template #image="{ item }">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="course-thumb"
          />
          <span v-else class="course-thumb-placeholder">{{ (item.name || '?').charAt(0) }}</span>
        </template>
        <template #actions="{ item }">
          <CButton color="warning" class="text-white" @click="openEditModal(item.id)">
            <CIcon :content="cilPencil" size="lg" />
          </CButton>
          <CButton color="danger" class="text-white" @click="deleteItem(item.id)">
            <CIcon :content="cilTrash" size="lg" />
          </CButton>
        </template>
      </ElegantCrudList>
    </template>

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
        <CForm @submit.prevent="isEditMode ? submitToEdit() : submitToCreate()">
          <CContainer>
            <CRow class="mb-3">
              <CCol>
                <CFormInput v-model="itemData.name" label="Nombre" placeholder="nombre..." required />
              </CCol>
              <CCol>
                <CFormInput
                  v-model="itemData.description"
                  label="Descripcion"
                  placeholder="descripcion..."
                  required
                />
              </CCol>
            </CRow>
            <CRow class="mb-3">
              <CCol>
                <label class="form-label">Imagen del curso</label>
                <CFormInput
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  @change="onImageSelected"
                />
                <small class="text-body-secondary">JPG, PNG, WEBP o GIF. Máx. 4 MB.</small>
                <div v-if="imagePreview" class="mt-3">
                  <img :src="imagePreview" alt="Vista previa" class="course-preview" />
                </div>
              </CCol>
            </CRow>
          </CContainer>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeModal()">Cancelar</CButton>
        <CButton color="primary" @click="isEditMode ? submitToEdit() : submitToCreate()">
          {{ isEditMode ? 'Actualizar' : 'Registrar' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import CourseService from '@/services/CourseService'
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import CardComponent from '@/components/cruds/CardComponent.vue'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import { cilPencil, cilTrash } from '@coreui/icons'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const items = ref([])
const isModalOpen = ref(false)
const isEditMode = ref(false)
const idItemSelected = ref(0)
const searchData = ref('')
const imagePreview = ref(null)
const itemData = ref({
  name: '',
  description: '',
  image: null,
  image_url: null,
})
const listColumns = ref([
  { key: 'id', label: 'N°' },
  { key: 'image', label: 'Imagen' },
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripcion' },
  { key: 'actions', label: 'OPCIONES' },
])

onMounted(async () => {
  try {
    await ListItem()
  } catch (error) {
    console.error(error)
  }
})

const ListItem = async (data) => {
  const response = await CourseService.getItems(data)
  items.value = response.data.data
}

const onImageSelected = (event) => {
  const file = event.target.files?.[0] || null
  itemData.value.image = file
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = file ? URL.createObjectURL(file) : itemData.value.image_url
}

const openCreateModal = () => {
  clearDataModal()
  isEditMode.value = false
  isModalOpen.value = true
}

const openEditModal = async (id) => {
  const response = await CourseService.getItem(id)
  idItemSelected.value = response.data.data.id
  itemData.value = {
    name: response.data.data.name || '',
    description: response.data.data.description || '',
    image: null,
    image_url: response.data.data.image_url || null,
  }
  imagePreview.value = response.data.data.image_url || null
  isEditMode.value = true
  isModalOpen.value = true
}

const clearDataModal = () => {
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = null
  itemData.value = {
    name: '',
    description: '',
    image: null,
    image_url: null,
  }
}

const closeModal = () => {
  isModalOpen.value = false
  clearDataModal()
}

const submitToCreate = async () => {
  try {
    await CourseService.createItem(itemData.value)
    ListItem()
    closeModal()
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Curso registrado con éxito.',
    })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.image?.[0] ||
      'No se pudo registrar el curso.'
    Swal.fire({
      icon: 'error',
      title: 'Error al Guardar',
      text: typeof message === 'string' ? message : message[0] || 'Error al guardar',
    })
  }
}

const submitToEdit = async () => {
  itemData.value.id = idItemSelected.value
  try {
    await CourseService.updateItem(itemData.value)
    ListItem()
    closeModal()
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: 'Curso actualizado con éxito.',
    })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.image?.[0] ||
      'No se pudo actualizar el curso.'
    Swal.fire({
      icon: 'error',
      title: 'Error al Guardar',
      text: typeof message === 'string' ? message : message[0] || 'Error al guardar',
    })
  }
}

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
    })
    if (confirmResult.isConfirmed) {
      await CourseService.deleteItem(id)
      ListItem()
      Swal.fire({
        icon: 'success',
        title: 'Curso eliminado',
        text: 'El curso ha sido eliminado exitosamente.',
      })
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Curso. Por favor, inténtalo de nuevo.',
    })
  }
}

watch(searchData, (newVal) => {
  ListItem(newVal)
})
</script>

<style scoped>
.course-thumb,
.course-thumb-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-border);
}

.course-thumb {
  object-fit: cover;
}

.course-thumb-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--rp-surface-brand-soft);
  color: var(--rp-text-brand);
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
}

.course-preview {
  max-width: min(100%, 15rem);
  max-height: 10rem;
  object-fit: cover;
  border-radius: var(--rp-radius-md);
  border: 1px solid var(--rp-border);
}
</style>

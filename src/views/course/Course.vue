<template>
  <div class="course-crud" :class="{ 'course-crud--embedded': embedded }">
    <ElegantCrudList
      :columns="listColumns"
      :data="sortedItems"
      empty-message="No hay cursos registrados."
      empty-hint="Los cursos del catálogo aparecerán aquí."
      empty-icon="📚"
    >
      <template #image="{ item }">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="course-thumb"
        />
        <span v-else class="course-thumb-placeholder">{{ (item.name || '?').charAt(0) }}</span>
      </template>

      <template #description="{ item }">
        <span class="course-description">{{ item.description || '—' }}</span>
      </template>

      <template #actions="{ item }">
        <div class="course-actions">
          <CButton
            color="warning"
            size="sm"
            class="text-white course-actions__btn"
            title="Editar"
            @click.stop="openEditModal(item.id)"
          >
            <CIcon :content="cilPencil" />
          </CButton>
        </div>
      </template>
    </ElegantCrudList>

    <CModal
      :visible="isModalOpen"
      scrollable
      size="lg"
      alignment="center"
      aria-labelledby="course-modal-title"
      @close="closeModal"
    >
      <CModalHeader class="bg-primary text-white border-0">
        <CModalTitle id="course-modal-title">Editar curso</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitToEdit">
          <div class="course-form-field mb-3">
            <CFormInput
              v-model="itemData.name"
              label="Nombre"
              placeholder="Nombre del curso"
              required
            />
          </div>
          <div class="course-form-field mb-3">
            <CFormLabel for="course-description">Descripción</CFormLabel>
            <CFormTextarea
              id="course-description"
              v-model="itemData.description"
              rows="5"
              placeholder="Descripción del curso"
              required
            />
          </div>
          <div class="course-form-field mb-0">
            <CFormLabel for="course-image">Imagen del curso</CFormLabel>
            <CFormInput
              id="course-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              @change="onImageSelected"
            />
            <small class="text-body-secondary d-block mt-1">
              JPG, PNG, WEBP o GIF. Máx. 4 MB.
            </small>
            <div v-if="imagePreview" class="mt-3">
              <img :src="imagePreview" alt="Vista previa" class="course-preview" />
            </div>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeModal">Cancelar</CButton>
        <CButton color="primary" @click="submitToEdit">Actualizar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import CourseService from '@/services/CourseService'
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import { cilPencil } from '@coreui/icons'
import { BRAND_COLOR } from '@/utils/brand'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const items = ref([])
const isModalOpen = ref(false)
const idItemSelected = ref(0)
const imagePreview = ref(null)
const itemData = ref({
  name: '',
  description: '',
  image: null,
  image_url: null,
})

const listColumns = computed(() => [
  { key: 'id', label: 'N°' },
  { key: 'image', label: 'Imagen' },
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripción', hideOnMobile: true },
  { key: 'actions', label: 'Opciones', center: true },
])

const sortedItems = computed(() =>
  [...items.value].sort((a, b) => Number(a.id) - Number(b.id)),
)

onMounted(async () => {
  try {
    await listItems()
  } catch (error) {
    console.error(error)
  }
})

const listItems = async () => {
  const response = await CourseService.getItems()
  items.value = response.data.data || []
}

const onImageSelected = (event) => {
  const file = event.target.files?.[0] || null
  itemData.value.image = file
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = file ? URL.createObjectURL(file) : itemData.value.image_url
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

const submitToEdit = async () => {
  itemData.value.id = idItemSelected.value
  try {
    await CourseService.updateItem(itemData.value)
    await listItems()
    closeModal()
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: 'Curso actualizado con éxito.',
      confirmButtonColor: BRAND_COLOR,
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
      confirmButtonColor: BRAND_COLOR,
    })
  }
}
</script>

<style scoped>
.course-crud {
  width: 100%;
}

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

.course-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 28rem;
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-snug);
  color: var(--rp-text);
}

.course-actions {
  display: inline-flex;
  justify-content: center;
}

.course-actions__btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
}

.course-form-field {
  min-width: 0;
}

.course-preview {
  max-width: min(100%, 15rem);
  max-height: 10rem;
  width: 100%;
  object-fit: cover;
  border-radius: var(--rp-radius-md);
  border: 1px solid var(--rp-border);
}

@media (min-width: 768px) {
  .course-actions__btn {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>

<template>
  <div class="module-page announcements-publish">
    <ModulePageHeader
      icon="fas fa-bullhorn"
      title="Principales"
      :subtitle="headerSubtitle"
    >
      <template #actions>
        <CButton color="info" class="text-white" @click="openCreateModal">
          <i class="fas fa-plus me-2"></i>Nuevo comunicado
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loadingList" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <EmptyState
      v-else-if="!publishedList.length"
      icon="📭"
      title="Sin comunicados principales"
      hint="Aquí aparecen borradores y publicados vigentes. Use «Nuevo comunicado» para crear uno."
      compact
    />

    <div v-else class="modern-table-shell">
      <CTable hover responsive class="mb-0 align-middle">
        <CTableHead color="info">
          <CTableRow>
            <CTableHeaderCell class="text-white">Título</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Inicio</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Fin</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Tipo</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Autor</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Estado</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Lectura</CTableHeaderCell>
            <CTableHeaderCell class="text-white text-center">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="item in publishedList" :key="item.id">
            <CTableDataCell>
              <div class="d-flex align-items-center gap-2">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  alt=""
                  class="rounded border"
                  style="width: 36px; height: 36px; object-fit: cover"
                />
                <div>
                  <div class="fw-semibold">{{ item.title }}</div>
                  <div v-if="item.last_modified_at" class="text-body-secondary small">
                    Modif.: {{ item.last_modified_by_name || '—' }} · {{ item.last_modified_at }}
                  </div>
                </div>
              </div>
            </CTableDataCell>
            <CTableDataCell class="small text-nowrap">{{ item.starts_at || '—' }}</CTableDataCell>
            <CTableDataCell class="small text-nowrap">{{ item.ends_at || '—' }}</CTableDataCell>
            <CTableDataCell class="small">{{ item.type_label || (item.is_general ? 'Institucional' : 'Aula') }}</CTableDataCell>
            <CTableDataCell class="small">{{ item.publisher_name || '—' }}</CTableDataCell>
            <CTableDataCell>
              <span class="status-badge" :class="statusBadgeClass(item)">
                {{ item.display_status_label || statusLabel(item) }}
              </span>
            </CTableDataCell>
            <CTableDataCell class="small">
              <template v-if="item.status === 'publicado' && item.read_stats">
                {{ item.read_stats.read }}/{{ item.read_stats.recipients }}
                <span class="text-body-secondary">({{ item.read_stats.percent }}%)</span>
              </template>
              <span v-else class="text-body-secondary">—</span>
            </CTableDataCell>
            <CTableDataCell class="text-center text-nowrap">
              <CButton
                size="sm"
                color="warning"
                class="text-white me-1"
                title="Editar"
                @click="openEditModal(item)"
              >
                <i class="fas fa-pen"></i>
              </CButton>
              <CButton
                v-if="item.status === 'borrador'"
                size="sm"
                color="primary"
                class="me-1"
                title="Publicar"
                @click="publishDraft(item)"
              >
                <i class="fas fa-paper-plane"></i>
              </CButton>
              <CButton
                v-if="item.status === 'publicado'"
                size="sm"
                color="success"
                class="me-1"
                title="Visualización"
                @click="goVisualization(item)"
              >
                <i class="fas fa-chart-bar"></i>
              </CButton>
              <CButton size="sm" color="info" variant="outline" title="Ver" @click="openDetail(item)">
                <i class="fas fa-eye"></i>
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <!-- Modal crear / editar -->
    <CModal :visible="formModalVisible" size="lg" alignment="center" @close="closeFormModal">
      <CModalHeader>
        <CModalTitle>{{ formModalTitle }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitForm">
          <div class="row g-3">
            <template v-if="!isPublishedEdit">
              <div class="col-12">
                <CFormLabel for="title">Título</CFormLabel>
                <CFormInput
                  id="title"
                  v-model="form.title"
                  maxlength="200"
                  placeholder="Ej. Suspensión de clases por feriado"
                  required
                />
              </div>

              <div class="col-12">
                <CFormLabel for="flyer">Afiche / flyer (opcional)</CFormLabel>
                <p class="text-body-secondary small mb-2">
                  Si adjunta una imagen, el texto es opcional. Sin imagen, el contenido es obligatorio.
                </p>
                <CFormInput
                  id="flyer"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  @change="onImageChange"
                />
                <div v-if="imagePreview || (existingImageUrl && !removeImage)" class="flyer-preview mt-2">
                  <img :src="imagePreview || existingImageUrl" alt="Vista previa del afiche" />
                  <CButton size="sm" color="danger" variant="outline" class="mt-2" type="button" @click="clearImage">
                    Quitar imagen
                  </CButton>
                </div>
              </div>

              <div class="col-12">
                <CFormLabel for="body">
                  Contenido
                  <span class="text-body-secondary fw-normal">
                    {{ hasImageContent ? '(opcional si hay afiche)' : '(obligatorio sin afiche)' }}
                  </span>
                </CFormLabel>
                <RichTextEditor
                  :key="editorKey"
                  v-model="form.body"
                  placeholder="Redacte el comunicado oficial..."
                />
              </div>
            </template>

            <div v-else class="col-12">
              <div class="alert alert-warning mb-0 py-2 small">
                Comunicado publicado: solo puede <strong>recortar o ampliar la fecha de fin</strong>
                (mínimo hoy). La fecha de inicio no se modifica.
              </div>
              <p class="fw-semibold mt-3 mb-1">{{ form.title }}</p>
            </div>

            <div class="col-md-6">
              <CFormLabel for="starts_at">Fecha de inicio</CFormLabel>
              <CFormInput
                id="starts_at"
                v-model="form.starts_at"
                type="date"
                required
                :disabled="isPublishedEdit"
              />
              <p v-if="!isPublishedEdit" class="text-body-secondary small mb-0 mt-1">
                Para publicar, la fecha de inicio debe ser hoy.
              </p>
            </div>

            <div class="col-md-6">
              <CFormLabel for="ends_at">Fecha de fin</CFormLabel>
              <CFormInput
                id="ends_at"
                v-model="form.ends_at"
                type="date"
                required
                :min="isPublishedEdit ? today() : null"
              />
              <p v-if="isPublishedEdit" class="text-body-secondary small mb-0 mt-1">
                Mínimo hoy ({{ today() }}). Puede ampliarla a más días si lo necesita.
              </p>
            </div>

            <div v-if="isInstitutional && !isPublishedEdit" class="col-12">
              <div class="alert alert-info mb-0 py-2 small">
                <i class="fas fa-info-circle me-1"></i>
                Comunicado <strong>institucional</strong>: se muestra a estudiantes (y padres con esa cuenta)
                y queda en lectura para docentes. Push solo a estudiantes.
              </div>
            </div>

            <div v-else-if="!isInstitutional && !isPublishedEdit" class="col-12">
              <div class="alert alert-info mb-3 py-2 small">
                <i class="fas fa-info-circle me-1"></i>
                Comunicado de <strong>aula</strong>: se muestra a los alumnos de las aulas seleccionadas
                al entrar al curso, dentro de la vigencia.
              </div>
              <CFormLabel>Aulas destinatarias</CFormLabel>
              <div v-if="loadingGrades" class="module-loading">
                <i class="fas fa-spinner fa-spin"></i> Cargando grados...
              </div>
              <EmptyState
                v-else-if="!gradeOptions.length"
                icon="🏫"
                title="Sin grados disponibles"
                hint="No tiene grados asignados para publicar comunicados."
                compact
              />
              <div v-else class="grade-check-grid">
                <label v-for="grade in gradeOptions" :key="grade.id">
                  <input
                    v-model="form.grade_section_ids"
                    type="checkbox"
                    class="form-check-input m-0"
                    :value="grade.id"
                  />
                  <span>{{ grade.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" :disabled="saving" @click="closeFormModal">Cancelar</CButton>
        <CButton
          v-if="!isPublishedEdit"
          color="secondary"
          variant="outline"
          :disabled="saving || !canSubmitDraft"
          @click="saveDraft"
        >
          {{ editingId ? 'Actualizar borrador' : 'Guardar borrador' }}
        </CButton>
        <CButton
          color="primary"
          :disabled="saving || (isPublishedEdit ? !canSubmitVigency : !canSubmitPublish)"
          @click="isPublishedEdit ? saveVigency() : submitForm()"
        >
          {{
            saving
              ? 'Guardando...'
              : isPublishedEdit
                ? 'Guardar vigencia'
                : 'Publicar'
          }}
        </CButton>
      </CModalFooter>
    </CModal>

    <AnnouncementAvisoOverlay
      :visible="detailVisible"
      :item="selectedItem"
      :index="0"
      :total="1"
      kind-label="Vista previa"
      confirm-label="Cerrar"
      :show-dismiss="false"
      @confirm="detailVisible = false"
      @dismiss="detailVisible = false"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import RichTextEditor from '@/components/forms/RichTextEditor.vue'
import AnnouncementAvisoOverlay from '@/components/announcements/AnnouncementAvisoOverlay.vue'
import { toastError, toastSuccess, toastWarning } from '@/utils/alerts'

const router = useRouter()

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const roleKey = localStorage.getItem('r_key') || ''
const secretKey = import.meta.env.VITE_ROLE_KEY?.toString() || ''
let decryptedRole = ''
try {
  decryptedRole = CryptoJS.AES.decrypt(roleKey, secretKey).toString(CryptoJS.enc.Utf8)
} catch {
  decryptedRole = ''
}

const isInstitutional = computed(() =>
  decryptedRole === 'DIRECCION' || decryptedRole === 'SECRETARIA'
)

const headerSubtitle = computed(() =>
  isInstitutional.value
    ? 'Borradores y publicados vigentes. Al finalizar la vigencia pasan a Historial.'
    : 'Borradores y publicados de sus aulas. Al finalizar la vigencia pasan a Historial.'
)

const today = () => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10)
}

const gradeOptions = ref([])
const publishedList = ref([])
const loadingGrades = ref(false)
const loadingList = ref(true)
const saving = ref(false)
const detailVisible = ref(false)
const formModalVisible = ref(false)
const selectedItem = ref(null)
const editorKey = ref(0)
const editingId = ref(null)
const editingStatus = ref('borrador')
const imageFile = ref(null)
const imagePreview = ref('')
const existingImageUrl = ref('')
const removeImage = ref(false)

const form = ref({
  title: '',
  body: '',
  grade_section_ids: [],
  starts_at: today(),
  ends_at: today(),
})

const isPublishedEdit = computed(
  () => !!editingId.value && editingStatus.value === 'publicado'
)

const formModalTitle = computed(() => {
  if (!editingId.value) return 'Nuevo comunicado'
  return isPublishedEdit.value ? 'Editar vigencia' : 'Editar borrador'
})

const hasImageContent = computed(
  () => !!imageFile.value || (!!existingImageUrl.value && !removeImage.value)
)

const baseDatesOk = computed(
  () =>
    !!form.value.starts_at &&
    !!form.value.ends_at &&
    form.value.ends_at >= form.value.starts_at
)

const contentOk = computed(() => {
  const bodyOk = stripHtml(form.value.body).length >= 10
  return bodyOk || hasImageContent.value
})

const canSubmitDraft = computed(() => {
  if (isPublishedEdit.value) return false
  const base =
    form.value.title.trim().length >= 3 && contentOk.value && baseDatesOk.value
  if (isInstitutional.value) return base
  return base && form.value.grade_section_ids.length > 0
})

const canSubmitPublish = computed(
  () => canSubmitDraft.value && form.value.starts_at === today()
)

const canSubmitVigency = computed(() => {
  if (!form.value.ends_at) return false
  if (form.value.ends_at < today()) return false
  if (form.value.starts_at && form.value.ends_at < form.value.starts_at) return false
  return true
})

const statusLabel = (item) => item.display_status_label || (
  item.display_status === 'finalizado' ? 'Finalizado'
    : item.status === 'publicado' ? 'Publicado' : 'Borrador'
)

const statusBadgeClass = (item) => {
  const s = item.display_status || item.status
  if (s === 'publicado') return 'status-badge--publicado'
  if (s === 'finalizado') return 'status-badge--finalizado'
  return 'status-badge--borrador'
}

const revokePreview = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = ''
  }
}

const onImageChange = (event) => {
  const file = event.target.files?.[0] || null
  revokePreview()
  imageFile.value = file
  removeImage.value = false
  if (file) imagePreview.value = URL.createObjectURL(file)
}

const clearImage = () => {
  revokePreview()
  imageFile.value = null
  removeImage.value = true
  const input = document.getElementById('flyer')
  if (input) input.value = ''
}

const resetForm = () => {
  editingId.value = null
  editingStatus.value = 'borrador'
  revokePreview()
  imageFile.value = null
  existingImageUrl.value = ''
  removeImage.value = false
  form.value = {
    title: '',
    body: '',
    grade_section_ids: [],
    starts_at: today(),
    ends_at: today(),
  }
}

const openCreateModal = async () => {
  resetForm()
  editorKey.value += 1
  formModalVisible.value = true
  if (!isInstitutional.value && !gradeOptions.value.length) await loadGrades()
}

const openEditModal = async (item) => {
  if (!isInstitutional.value && !gradeOptions.value.length) await loadGrades()

  try {
    const response = await OfficialAnnouncementService.getItem(item.id)
    if (!response.data.success) {
      toastError(response.data.message || 'No se pudo cargar el comunicado.')
      return
    }

    const data = response.data.data
    editingId.value = data.id
    editingStatus.value = data.status || 'borrador'
    revokePreview()
    imageFile.value = null
    removeImage.value = false
    existingImageUrl.value = data.image_url || ''
    form.value = {
      title: data.title || '',
      body: data.body || '',
      grade_section_ids: (data.grade_sections || []).map((g) => g.id),
      starts_at: data.starts_at || today(),
      ends_at: data.ends_at || today(),
    }
    editorKey.value += 1
    formModalVisible.value = true
  } catch (error) {
    toastError(error.response?.data?.message || 'No se pudo cargar el comunicado.')
  }
}

const closeFormModal = () => {
  formModalVisible.value = false
  editingId.value = null
  revokePreview()
}

const loadGrades = async () => {
  loadingGrades.value = true
  try {
    const response = await OfficialAnnouncementService.getTargetGrades()
    if (response.data.success) gradeOptions.value = response.data.data || []
    else toastError(response.data.message || 'No se pudieron cargar los grados.')
  } catch (error) {
    toastError(error.response?.data?.message || 'Error al cargar grados.')
  } finally {
    loadingGrades.value = false
  }
}

const loadPublished = async () => {
  loadingList.value = true
  try {
    const response = await OfficialAnnouncementService.listPublished({ scope: 'active' })
    if (response.data.success) publishedList.value = response.data.data || []
  } catch (error) {
    toastError(error.response?.data?.message || 'Error al cargar comunicados.')
  } finally {
    loadingList.value = false
  }
}

const saveAnnouncement = async (publish) => {
  if (publish ? !canSubmitPublish.value : !canSubmitDraft.value) {
    if (publish && form.value.starts_at !== today()) {
      toastWarning(`Para publicar, la fecha de inicio debe ser hoy (${today()}).`)
    }
    return
  }

  saving.value = true

  try {
    const payload = {
      title: form.value.title.trim(),
      body: form.value.body,
      starts_at: form.value.starts_at,
      ends_at: form.value.ends_at,
      publish,
      is_general: isInstitutional.value,
      remove_image: removeImage.value && !imageFile.value,
    }
    if (imageFile.value) payload.image = imageFile.value
    if (!isInstitutional.value) payload.grade_section_ids = form.value.grade_section_ids

    const response = editingId.value
      ? await OfficialAnnouncementService.update(editingId.value, payload)
      : await OfficialAnnouncementService.create(payload)

    if (response.data.success) {
      toastSuccess(response.data.message || 'Comunicado guardado')
      resetForm()
      closeFormModal()
      await loadPublished()
    } else {
      toastError(response.data.message || 'No se pudo guardar el comunicado.')
    }
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'Error al guardar el comunicado.'
    toastError(typeof msg === 'string' ? msg : 'Error al guardar el comunicado.')
  } finally {
    saving.value = false
  }
}

const saveVigency = async () => {
  if (!canSubmitVigency.value || !editingId.value) {
    if (form.value.ends_at && form.value.ends_at < today()) {
      toastWarning(`La fecha de fin no puede ser anterior a hoy (${today()}).`)
    }
    return
  }
  saving.value = true
  try {
    const response = await OfficialAnnouncementService.update(editingId.value, {
      vigency_only: true,
      ends_at: form.value.ends_at,
    })
    if (response.data.success) {
      toastSuccess(response.data.message || 'Vigencia actualizada')
      closeFormModal()
      await loadPublished()
    } else {
      toastError(response.data.message || 'No se pudo actualizar la vigencia.')
    }
  } catch (error) {
    toastError(error.response?.data?.message || 'Error al actualizar la vigencia.')
  } finally {
    saving.value = false
  }
}

const submitForm = () => saveAnnouncement(true)
const saveDraft = () => saveAnnouncement(false)

const openDetail = async (item) => {
  try {
    const response = await OfficialAnnouncementService.getItem(item.id)
    if (response.data.success) {
      selectedItem.value = response.data.data
      detailVisible.value = true
    }
  } catch (error) {
    toastError(error.response?.data?.message || 'No se pudo cargar el detalle.')
  }
}

const goVisualization = (item) => {
  router.push({ path: `/announcements/${item.id}/visualization`, query: { from: 'publish' } })
}

const publishDraft = async (item) => {
  saving.value = true
  try {
    const response = await OfficialAnnouncementService.publish(item.id)
    if (response.data.success) {
      toastSuccess(response.data.message || 'Comunicado publicado')
      await loadPublished()
    } else {
      toastError(response.data.message || 'No se pudo publicar el borrador.')
    }
  } catch (error) {
    toastError(error.response?.data?.message || 'Error al publicar el borrador.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadPublished()
  if (!isInstitutional.value) await loadGrades()
})

onBeforeUnmount(revokePreview)
</script>

<style scoped>
.flyer-preview img {
  display: block;
  max-width: 100%;
  max-height: 220px;
  border-radius: 0.75rem;
  border: 1px solid var(--cui-border-color, #e2e8f0);
  object-fit: contain;
  background: #0f172a;
}
</style>

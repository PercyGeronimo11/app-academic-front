<template>
  <div class="module-page announcements-publish">
    <ModulePageHeader
      icon="fas fa-bullhorn"
      title="Comunicados oficiales"
      :subtitle="headerSubtitle"
    >
      <template #actions>
        <CButton color="info" class="text-white" @click="openCreateModal">
          <i class="fas fa-plus me-2"></i>Nuevo comunicado
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="successMessage" class="module-alert module-alert--success">{{ successMessage }}</div>

    <div v-if="loadingList" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <EmptyState
      v-else-if="!publishedList.length"
      icon="📭"
      title="Sin comunicados registrados"
      hint="Use el botón «Nuevo comunicado» para crear el primero."
      compact
    />

    <div v-else class="modern-table-shell">
      <CTable hover responsive class="mb-0">
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell>Vigencia</CTableHeaderCell>
            <CTableHeaderCell>Título</CTableHeaderCell>
            <CTableHeaderCell>Alcance</CTableHeaderCell>
            <CTableHeaderCell>Estado</CTableHeaderCell>
            <CTableHeaderCell>Prioridad</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="item in publishedList" :key="item.id">
            <CTableDataCell class="small">
              <div>{{ formatRange(item.starts_at, item.ends_at) }}</div>
              <span
                v-if="item.status === 'publicado'"
                class="status-badge"
                :class="item.is_active ? 'status-badge--publicado' : 'status-badge--borrador'"
              >
                {{ item.is_active ? 'Vigente' : 'Fuera de vigencia' }}
              </span>
            </CTableDataCell>
            <CTableDataCell class="fw-semibold">{{ item.title }}</CTableDataCell>
            <CTableDataCell class="small text-body-secondary">
              {{ item.is_general ? 'General' : item.target_labels }}
            </CTableDataCell>
            <CTableDataCell>
              <span
                class="status-badge"
                :class="item.status === 'publicado' ? 'status-badge--publicado' : 'status-badge--borrador'"
              >
                {{ item.status === 'publicado' ? 'Publicado' : 'Borrador' }}
              </span>
            </CTableDataCell>
            <CTableDataCell>
              <span class="priority-badge" :class="`priority-badge--${item.priority}`">
                {{ priorityLabel(item.priority) }}
              </span>
            </CTableDataCell>
            <CTableDataCell class="text-center">
              <CButton
                v-if="item.status === 'borrador'"
                size="sm"
                color="warning"
                class="text-white me-1"
                @click="openEditModal(item)"
              >
                Editar
              </CButton>
              <CButton
                v-if="item.status === 'borrador'"
                size="sm"
                color="primary"
                class="me-1"
                @click="publishDraft(item)"
              >
                Publicar
              </CButton>
              <CButton size="sm" color="info" variant="outline" @click="openDetail(item)">
                Ver
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <!-- Modal crear / editar -->
    <CModal :visible="formModalVisible" size="lg" alignment="center" @close="closeFormModal">
      <CModalHeader>
        <CModalTitle>{{ editingId ? 'Editar borrador' : 'Nuevo comunicado' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitForm">
          <div class="row g-3">
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
              <CFormLabel for="body">Contenido</CFormLabel>
              <RichTextEditor
                :key="editorKey"
                v-model="form.body"
                placeholder="Redacte el comunicado oficial..."
              />
            </div>

            <div class="col-md-4">
              <CFormLabel for="priority">Prioridad</CFormLabel>
              <CFormSelect id="priority" v-model="form.priority">
                <option value="normal">Normal</option>
                <option value="importante">Importante</option>
                <option value="urgente">Urgente</option>
              </CFormSelect>
            </div>

            <div class="col-md-4">
              <CFormLabel for="starts_at">Fecha de inicio</CFormLabel>
              <CFormInput id="starts_at" v-model="form.starts_at" type="date" required />
            </div>

            <div class="col-md-4">
              <CFormLabel for="ends_at">Fecha de fin</CFormLabel>
              <CFormInput id="ends_at" v-model="form.ends_at" type="date" required />
            </div>

            <div v-if="isDirection" class="col-12">
              <div class="alert alert-info mb-0 py-2 small">
                <i class="fas fa-info-circle me-1"></i>
                Los comunicados de dirección son <strong>generales</strong>: se muestran a todos los usuarios
                al iniciar sesión mientras estén vigentes.
              </div>
            </div>

            <div v-else class="col-12">
              <div class="alert alert-info mb-3 py-2 small">
                <i class="fas fa-info-circle me-1"></i>
                Estos comunicados se muestran a los alumnos de las aulas seleccionadas
                <strong> al entrar al curso</strong> de este docente, solo si la fecha actual está dentro de la vigencia.
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
          color="secondary"
          variant="outline"
          :disabled="saving || !canSubmit"
          @click="saveDraft"
        >
          {{ editingId ? 'Actualizar borrador' : 'Guardar borrador' }}
        </CButton>
        <CButton color="primary" :disabled="saving || !canSubmit" @click="submitForm">
          {{ saving ? 'Guardando...' : 'Publicar' }}
        </CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal detalle -->
    <CModal :visible="detailVisible" size="lg" @close="detailVisible = false">
      <CModalHeader>
        <CModalTitle>{{ selectedItem?.title }}</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="selectedItem">
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="priority-badge" :class="`priority-badge--${selectedItem.priority}`">
            {{ priorityLabel(selectedItem.priority) }}
          </span>
          <span class="text-body-secondary small">
            {{ formatRange(selectedItem.starts_at, selectedItem.ends_at) }}
          </span>
        </div>
        <p class="text-body-secondary small mb-3">
          <i class="fas fa-users me-1"></i>{{ selectedItem.target_labels }}
        </p>
        <div class="announcement-detail-body" v-html="selectedItem.body"></div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="detailVisible = false">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CryptoJS from 'crypto-js'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'
import RichTextEditor from '@/components/forms/RichTextEditor.vue'

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

const isDirection = computed(() => decryptedRole === 'DIRECCION')

const headerSubtitle = computed(() =>
  isDirection.value
    ? 'Publique comunicados generales: se muestran al iniciar sesión mientras estén vigentes.'
    : 'Publique a sus aulas: el alumno lo verá al entrar a su curso, dentro del rango de fechas.'
)

const gradeOptions = ref([])
const publishedList = ref([])
const loadingGrades = ref(false)
const loadingList = ref(true)
const saving = ref(false)
const loadError = ref('')
const successMessage = ref('')
const detailVisible = ref(false)
const formModalVisible = ref(false)
const selectedItem = ref(null)
const editorKey = ref(0)
const editingId = ref(null)

const today = () => new Date().toISOString().slice(0, 10)

const form = ref({
  title: '',
  body: '',
  priority: 'normal',
  grade_section_ids: [],
  starts_at: today(),
  ends_at: today(),
})

const canSubmit = computed(() => {
  const base =
    form.value.title.trim().length >= 3 &&
    stripHtml(form.value.body).length >= 10 &&
    !!form.value.starts_at &&
    !!form.value.ends_at &&
    form.value.ends_at >= form.value.starts_at

  if (isDirection.value) return base
  return base && form.value.grade_section_ids.length > 0
})

const priorityLabels = {
  normal: 'Normal',
  importante: 'Importante',
  urgente: 'Urgente',
}

const priorityLabel = (value) => priorityLabels[value] || value

const formatRange = (start, end) => {
  if (!start && !end) return '—'
  if (start && end) return `${start} → ${end}`
  return start || end
}

const resetForm = () => {
  editingId.value = null
  form.value = {
    title: '',
    body: '',
    priority: 'normal',
    grade_section_ids: [],
    starts_at: today(),
    ends_at: today(),
  }
}

const openCreateModal = async () => {
  resetForm()
  editorKey.value += 1
  successMessage.value = ''
  loadError.value = ''
  formModalVisible.value = true
  if (!isDirection.value && !gradeOptions.value.length) {
    await loadGrades()
  }
}

const openEditModal = async (item) => {
  successMessage.value = ''
  loadError.value = ''

  if (!isDirection.value && !gradeOptions.value.length) {
    await loadGrades()
  }

  try {
    const response = await OfficialAnnouncementService.getItem(item.id)
    if (!response.data.success) {
      loadError.value = response.data.message || 'No se pudo cargar el borrador.'
      return
    }

    const data = response.data.data
    if (data.status !== 'borrador') {
      loadError.value = 'Solo se pueden editar comunicados en borrador.'
      return
    }

    editingId.value = data.id
    form.value = {
      title: data.title || '',
      body: data.body || '',
      priority: data.priority || 'normal',
      grade_section_ids: (data.grade_sections || []).map((g) => g.id),
      starts_at: data.starts_at || today(),
      ends_at: data.ends_at || today(),
    }
    editorKey.value += 1
    formModalVisible.value = true
  } catch (error) {
    loadError.value = error.response?.data?.message || 'No se pudo cargar el borrador.'
  }
}

const closeFormModal = () => {
  formModalVisible.value = false
  editingId.value = null
}

const loadGrades = async () => {
  loadingGrades.value = true
  try {
    const response = await OfficialAnnouncementService.getTargetGrades()
    if (response.data.success) {
      gradeOptions.value = response.data.data || []
    } else {
      loadError.value = response.data.message || 'No se pudieron cargar los grados.'
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar grados.'
  } finally {
    loadingGrades.value = false
  }
}

const loadPublished = async () => {
  loadingList.value = true
  try {
    const response = await OfficialAnnouncementService.listPublished()
    if (response.data.success) {
      publishedList.value = response.data.data || []
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar comunicados.'
  } finally {
    loadingList.value = false
  }
}

const saveAnnouncement = async (publish) => {
  if (!canSubmit.value) return

  saving.value = true
  loadError.value = ''
  successMessage.value = ''

  try {
    const payload = {
      title: form.value.title.trim(),
      body: form.value.body,
      priority: form.value.priority,
      starts_at: form.value.starts_at,
      ends_at: form.value.ends_at,
      publish,
      is_general: isDirection.value,
    }

    if (!isDirection.value) {
      payload.grade_section_ids = form.value.grade_section_ids
    }

    const response = editingId.value
      ? await OfficialAnnouncementService.update(editingId.value, payload)
      : await OfficialAnnouncementService.create(payload)

    if (response.data.success) {
      successMessage.value = response.data.message
      resetForm()
      closeFormModal()
      await loadPublished()
    } else {
      loadError.value = response.data.message || 'No se pudo guardar el comunicado.'
    }
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'Error al guardar el comunicado.'
    loadError.value = typeof msg === 'string' ? msg : 'Error al guardar el comunicado.'
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
    loadError.value = error.response?.data?.message || 'No se pudo cargar el detalle.'
  }
}

const publishDraft = async (item) => {
  saving.value = true
  loadError.value = ''
  successMessage.value = ''
  try {
    const response = await OfficialAnnouncementService.publish(item.id)
    if (response.data.success) {
      successMessage.value = response.data.message
      await loadPublished()
    } else {
      loadError.value = response.data.message || 'No se pudo publicar el borrador.'
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al publicar el borrador.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadPublished()
  if (!isDirection.value) {
    await loadGrades()
  }
})
</script>

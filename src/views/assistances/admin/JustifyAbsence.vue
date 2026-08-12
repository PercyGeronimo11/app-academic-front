<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <h5 class="fw-bold text-primary mb-2">
              <i class="fas fa-file-signature me-2"></i>
              Justificar faltas
            </h5>

            <div class="justify-rule-banner mb-3">
              <i class="fas fa-info-circle me-2"></i>
              Solo se pueden justificar inasistencias de hasta
              <strong>{{ maxDaysBack }} días</strong> atrás
              (desde {{ minDateLabel }} hasta hoy).
            </div>

            <CRow class="g-2 align-items-end">
              <CCol xs="6" md="2">
                <label class="form-label fw-semibold mb-1">Desde</label>
                <CFormInput
                  v-model="filters.desde"
                  type="date"
                  :min="minDateIso"
                  :max="maxDateIso"
                />
              </CCol>
              <CCol xs="6" md="2">
                <label class="form-label fw-semibold mb-1">Hasta</label>
                <CFormInput
                  v-model="filters.hasta"
                  type="date"
                  :min="minDateIso"
                  :max="maxDateIso"
                />
              </CCol>
              <CCol xs="12" md="3">
                <label class="form-label fw-semibold mb-1">Buscar</label>
                <CFormInput
                  v-model="filters.search"
                  placeholder="Buscar por apellido..."
                  @keyup.enter="fetchList(1)"
                />
              </CCol>
              <CCol xs="6" md="1">
                <label class="form-label fw-semibold mb-1">Grado</label>
                <CFormSelect v-model="filters.grade">
                  <option value="">Todos</option>
                  <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
                </CFormSelect>
              </CCol>
              <CCol xs="6" md="1">
                <label class="form-label fw-semibold mb-1">Sección</label>
                <CFormSelect v-model="filters.section">
                  <option value="">Todas</option>
                  <option v-for="s in secciones" :key="s" :value="s">{{ s }}</option>
                </CFormSelect>
              </CCol>
              <CCol xs="6" md="auto">
                <CButton color="primary" class="w-100" @click="fetchList(1)">Buscar</CButton>
              </CCol>
              <CCol xs="6" md="auto">
                <CButton color="secondary" variant="outline" class="w-100" @click="limpiar">
                  Limpiar
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-4">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell assist-table-tight list-with-pagination-wrap">
              <CTable hover responsive align="middle" class="mb-0">
                <CTableHead color="info" class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-white text-center d-none d-md-table-cell" style="width: 3rem">
                      N°
                    </CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-none d-md-table-cell">Apellidos</CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-none d-md-table-cell">Nombres</CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-md-none text-start">Alumno</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-md-table-cell">Grado</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Fecha</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Asistencia</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="loading">
                    <CTableRow>
                      <CTableDataCell colspan="8" class="list-empty-message py-4">
                        Cargando…
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else-if="!items.length">
                    <CTableRow>
                      <CTableDataCell colspan="8" class="list-empty-message py-4">
                        No hay faltas injustificadas para el rango seleccionado.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="(item, index) in items" :key="item.assistance_id">
                      <CTableDataCell class="text-center d-none d-md-table-cell">
                        {{ (currentPage - 1) * pageSize + index + 1 }}
                      </CTableDataCell>
                      <CTableDataCell class="fw-semibold text-start d-none d-md-table-cell">
                        {{ item.apellidos }}
                      </CTableDataCell>
                      <CTableDataCell class="text-start d-none d-md-table-cell">
                        {{ item.nombres }}
                      </CTableDataCell>
                      <CTableDataCell class="d-md-none text-start">
                        <div class="assist-name-stack">
                          <span class="assist-name-surnames">{{ item.apellidos }}</span>
                          <span class="assist-name-given">{{ item.nombres }}</span>
                          <span class="assist-name-aula">{{ item.grade }}° {{ item.section }}</span>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-md-table-cell">
                        {{ item.grade }}° {{ item.section }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center fw-medium">
                        {{ formatDate(item.fecha_hora) }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado(item.estado)" class="assist-badge-sm">
                          {{ textoEstado(item.estado) }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <CButton
                          size="sm"
                          color="warning"
                          class="text-white"
                          title="Justificar falta"
                          @click="openModal(item)"
                        >
                          <i class="fas fa-file-signature me-1"></i>
                          Justificar
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>

              <TablePagination
                :model-value="currentPage"
                :total="totalCount"
                :page-size="pageSize"
                aria-label="Paginación de faltas a justificar"
                @update:model-value="fetchList"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal
      :visible="modalVisible"
      alignment="center"
      backdrop="static"
      class="justify-absence-modal"
      @close="closeModal"
    >
      <CModalHeader>
        <CModalTitle>Justificar falta</CModalTitle>
      </CModalHeader>
      <CModalBody class="justify-absence-modal__body">
        <div v-if="selected" class="mb-3">
          <div class="fw-semibold">{{ selected.apellidos }} {{ selected.nombres }}</div>
          <div class="text-body-secondary small">
            {{ selected.grade }}° {{ selected.section }}
            · {{ formatDate(selected.fecha_hora) }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold" for="justify-reason">Motivo</label>
          <CFormTextarea
            id="justify-reason"
            v-model="form.reason"
            rows="3"
            placeholder="Indique el motivo de la justificación..."
          />
        </div>

        <div class="mb-1">
          <label class="form-label fw-semibold" for="justify-tramite-search">
            Código de trámite (INA)
          </label>
          <div ref="tramiteComboRoot" class="tramite-combobox">
            <CFormInput
              id="justify-tramite-search"
              v-model="tramiteSearch"
              type="search"
              autocomplete="off"
              placeholder="Buscar por código INA-… o asunto"
              :disabled="loadingTramites"
              @focus="openTramiteMenu"
              @input="onTramiteSearchInput"
              @keydown.down.prevent="moveTramiteHighlight(1)"
              @keydown.up.prevent="moveTramiteHighlight(-1)"
              @keydown.enter.prevent="selectHighlightedTramite"
              @keydown.esc="closeTramiteMenu"
            />
            <ul v-if="tramiteMenuOpen" class="tramite-combobox__menu">
              <li v-if="loadingTramites" class="tramite-combobox__empty">
                Cargando trámites…
              </li>
              <template v-else>
                <li
                  v-for="(item, index) in filteredTramites"
                  :key="item.id"
                  :class="{
                    'is-active': highlightedTramiteIndex === index,
                    'is-selected': form.request_reference === item.request_number,
                  }"
                  @mousedown.prevent.stop
                  @click.prevent.stop="selectTramite(item)"
                >
                  <span class="tramite-combobox__code">{{ item.request_number || `#${item.id}` }}</span>
                  <span class="tramite-combobox__meta">
                    {{ item.current_status }}
                    <template v-if="item.created_at"> · {{ item.created_at }}</template>
                  </span>
                </li>
                <li v-if="!filteredTramites.length" class="tramite-combobox__empty">
                  Sin trámites INA disponibles para este alumno
                </li>
              </template>
            </ul>
          </div>
          <p v-if="form.request_reference" class="small text-success mb-0 mt-1">
            Seleccionado: <strong>{{ form.request_reference }}</strong>
          </p>
          <p v-else class="small text-body-secondary mb-0 mt-1">
            Seleccione el trámite de justificación de inasistencia del alumno.
          </p>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" :disabled="saving" @click="closeModal">
          Cancelar
        </CButton>
        <CButton color="warning" class="text-white" :disabled="saving || !canSubmit" @click="submitJustify">
          <i v-if="saving" class="fas fa-spinner fa-spin me-1" aria-hidden="true"></i>
          {{ saving ? 'Guardando…' : 'Justificar falta' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </CContainer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import PaperworkService from '@/services/PaperworkService'
import TablePagination from '@/components/academic/TablePagination.vue'
import { textoEstado, colorEstado } from '@/utils/utils'
import { formatDate } from '@/utils/time'
import { toastError, toastSuccess } from '@/utils/alerts'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/vue'

const MAX_DAYS_BACK = 15

const toIsoDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const today = new Date()
const minDate = new Date(today)
minDate.setDate(today.getDate() - MAX_DAYS_BACK)

const maxDateIso = toIsoDate(today)
const minDateIso = toIsoDate(minDate)
const maxDaysBack = MAX_DAYS_BACK
const minDateLabel = computed(() => formatDate(minDateIso))

const filters = ref({
  desde: minDateIso,
  hasta: maxDateIso,
  search: '',
  grade: '',
  section: '',
})

const grados = ['1', '2', '3', '4', '5']
const secciones = ['A', 'B', 'C', 'D']

const items = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 15
const totalCount = ref(0)

const modalVisible = ref(false)
const selected = ref(null)
const saving = ref(false)
const form = ref({
  reason: '',
  request_reference: '',
})

const tramites = ref([])
const loadingTramites = ref(false)
const tramiteSearch = ref('')
const tramiteMenuOpen = ref(false)
const highlightedTramiteIndex = ref(0)
const tramiteComboRoot = ref(null)
let searchDebounce = null

const filteredTramites = computed(() => {
  const q = tramiteSearch.value.trim().toLowerCase()
  if (!q) return tramites.value
  return tramites.value.filter((item) => {
    const haystack = [
      item.request_number,
      item.subject,
      item.reason,
      item.current_status,
      item.label,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const canSubmit = computed(() =>
  form.value.reason.trim().length >= 3 && !!form.value.request_reference
)

const validateRange = () => {
  if (!filters.value.desde || !filters.value.hasta) {
    toastError('Seleccione fecha desde y hasta.')
    return false
  }
  if (filters.value.hasta < filters.value.desde) {
    toastError('La fecha hasta debe ser posterior o igual a la fecha desde.')
    return false
  }
  if (filters.value.desde < minDateIso || filters.value.hasta > maxDateIso) {
    toastError(`Solo puede consultar faltas de los últimos ${MAX_DAYS_BACK} días.`)
    return false
  }
  return true
}

const fetchList = async (page = 1) => {
  if (!validateRange()) return

  loading.value = true
  try {
    const res = await AssistanceService.listUnjustifiedAbsences({
      page,
      page_size: pageSize,
      desde: filters.value.desde,
      hasta: filters.value.hasta,
      search: filters.value.search,
      grade: filters.value.grade,
      section: filters.value.section,
    })
    items.value = res.data.results || []
    totalCount.value = res.data.count || 0
    currentPage.value = page
  } catch (error) {
    items.value = []
    totalCount.value = 0
    toastError(error.response?.data?.mensaje || 'No se pudo cargar la lista')
  } finally {
    loading.value = false
  }
}

const limpiar = () => {
  filters.value = {
    desde: minDateIso,
    hasta: maxDateIso,
    search: '',
    grade: '',
    section: '',
  }
  fetchList(1)
}

const loadTramites = async (search = '') => {
  const userId = selected.value?.user_id
  if (!userId) {
    tramites.value = []
    return
  }

  loadingTramites.value = true
  try {
    const res = await PaperworkService.listForJustification({
      user_id: userId,
      search: search || undefined,
    })
    if (res.data.success) {
      tramites.value = res.data.data || []
    } else {
      tramites.value = []
      toastError(res.data.message || 'No se pudieron cargar los trámites.')
    }
  } catch (error) {
    tramites.value = []
    toastError(error.response?.data?.message || 'Error al cargar trámites.')
  } finally {
    loadingTramites.value = false
  }
}

const openTramiteMenu = () => {
  tramiteMenuOpen.value = true
  highlightedTramiteIndex.value = 0
}

const closeTramiteMenu = () => {
  tramiteMenuOpen.value = false
}

const onTramiteSearchInput = () => {
  openTramiteMenu()
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    loadTramites(tramiteSearch.value.trim())
  }, 280)
}

const selectTramite = (item) => {
  form.value.request_reference = item.request_number || String(item.id)
  tramiteSearch.value = item.request_number || item.label || ''
  closeTramiteMenu()
}

const moveTramiteHighlight = (delta) => {
  if (!filteredTramites.value.length) return
  openTramiteMenu()
  const max = filteredTramites.value.length - 1
  highlightedTramiteIndex.value = Math.min(
    max,
    Math.max(0, highlightedTramiteIndex.value + delta),
  )
}

const selectHighlightedTramite = () => {
  const item = filteredTramites.value[highlightedTramiteIndex.value]
  if (item) selectTramite(item)
}

const onDocumentClick = (event) => {
  if (!tramiteComboRoot.value?.contains(event.target)) {
    closeTramiteMenu()
  }
}

const openModal = async (item) => {
  selected.value = item
  form.value = { reason: '', request_reference: '' }
  tramiteSearch.value = ''
  tramites.value = []
  modalVisible.value = true
  highlightedTramiteIndex.value = 0
  await loadTramites()
  openTramiteMenu()
}

const closeModal = () => {
  modalVisible.value = false
  selected.value = null
  form.value = { reason: '', request_reference: '' }
  tramiteSearch.value = ''
  tramites.value = []
  closeTramiteMenu()
}

const submitJustify = async () => {
  if (!selected.value || !canSubmit.value) {
    toastError('Complete el motivo y seleccione el código de trámite.')
    return
  }

  saving.value = true
  try {
    const res = await AssistanceService.justifyAbsence({
      assistance_id: selected.value.assistance_id,
      reason: form.value.reason.trim(),
      request_reference: form.value.request_reference,
    })
    toastSuccess(res.data?.mensaje || 'Falta justificada correctamente')
    closeModal()
    await fetchList(currentPage.value)
  } catch (error) {
    toastError(error.response?.data?.mensaje || 'No se pudo justificar la falta')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchList(1)
  document.addEventListener('mousedown', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  clearTimeout(searchDebounce)
})
</script>

<style scoped>
.justify-rule-banner {
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--cui-info, #3d94d6) 12%, #fff);
  border: 1px solid color-mix(in srgb, var(--cui-info, #3d94d6) 28%, #fff);
  color: var(--cui-body-color, #212529);
  font-size: 0.9rem;
  line-height: 1.35;
}

.assist-name-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  line-height: 1.25;
}

.assist-name-surnames {
  font-weight: 700;
  font-size: 0.9rem;
}

.assist-name-given,
.assist-name-aula {
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--cui-secondary-color, #6c757d);
}

.tramite-combobox {
  position: relative;
  z-index: 2;
}

.tramite-combobox__menu {
  position: absolute;
  z-index: 1080;
  left: 0;
  right: 0;
  top: calc(100% + 0.25rem);
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
  background: var(--cui-body-bg, #fff);
  border: 1px solid var(--cui-border-color, #d8dbe0);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
}

.tramite-combobox__menu li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
}

.tramite-combobox__menu li:hover,
.tramite-combobox__menu li.is-active {
  background: color-mix(in srgb, var(--cui-primary, #321fdb) 10%, #fff);
}

.tramite-combobox__menu li.is-selected {
  background: color-mix(in srgb, var(--cui-success, #2eb85c) 12%, #fff);
}

.tramite-combobox__code {
  font-weight: 700;
  font-size: 0.9rem;
}

.tramite-combobox__meta {
  font-size: 0.75rem;
  color: var(--cui-secondary-color, #6c757d);
}

.tramite-combobox__empty {
  cursor: default;
  color: var(--cui-secondary-color, #6c757d);
  font-size: 0.85rem;
}
</style>

<style>
/* El menú del combobox debe poder desbordar el body del modal sin cortarse
   ni caer sobre el backdrop (eso cerraba el modal al seleccionar). */
.justify-absence-modal .modal-content {
  overflow: visible;
}

.justify-absence-modal .justify-absence-modal__body,
.justify-absence-modal .modal-body {
  overflow: visible;
}
</style>

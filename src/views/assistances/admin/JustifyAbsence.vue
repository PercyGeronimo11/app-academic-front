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

    <CModal :visible="modalVisible" alignment="center" @close="closeModal">
      <CModalHeader>
        <CModalTitle>Justificar falta</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="selected" class="mb-3">
          <div class="fw-semibold">{{ selected.apellidos }} {{ selected.nombres }}</div>
          <div class="text-body-secondary small">
            {{ selected.grade }}° {{ selected.section }}
            · {{ formatDate(selected.fecha_hora) }}
          </div>
        </div>

        <div class="justify-wip-box text-center py-4 px-3">
          <i class="fas fa-tools fa-2x mb-3 text-secondary"></i>
          <p class="fw-semibold mb-1">Formulario en proceso</p>
          <p class="mb-0 small text-body-secondary">
            Pronto podrás ingresar el motivo y vincular el trámite de justificación de inasistencia.
          </p>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="closeModal">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </CContainer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import TablePagination from '@/components/academic/TablePagination.vue'
import { textoEstado, colorEstado } from '@/utils/utils'
import { formatDate } from '@/utils/time'
import { toastError } from '@/utils/alerts'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
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

const openModal = (item) => {
  selected.value = item
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  selected.value = null
}

onMounted(() => {
  fetchList(1)
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

.justify-wip-box {
  border: 1px dashed var(--cui-border-color, #d8dbe0);
  border-radius: 0.5rem;
  background: var(--cui-tertiary-bg, #f8f9fa);
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
</style>

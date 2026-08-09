<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="historial-header">
              <div class="historial-header__top">
                <h4 class="historial-header__title">
                  Historial de Asistencias
                </h4>
                <CButton color="info" variant="outline" class="historial-header__back" @click="goBack">
                  <i class="fas fa-arrow-left me-1"></i>
                  Volver
                </CButton>
              </div>

              <div class="historial-header__meta">
                <div class="text-body mb-1">
                  Alumno:
                  <span class="fw-semibold text-body">
                    {{ alumno.name }} {{ alumno.apellidos }}
                  </span>
                </div>
                <div class="text-body-secondary">
                  Grado:
                  <span class="fw-semibold text-body">
                    {{ alumno.grade }}° {{ alumno.section }}
                  </span>
                </div>
              </div>
            </div>

            <CRow class="g-2 align-items-end">
              <CCol xs="6" md="3">
                <label class="form-label fw-semibold mb-1">Desde</label>
                <CFormInput v-model="filters.desde" type="date" />
              </CCol>

              <CCol xs="6" md="3">
                <label class="form-label fw-semibold mb-1">Hasta</label>
                <CFormInput v-model="filters.hasta" type="date" />
              </CCol>

              <CCol xs="12" md="3">
                <label class="form-label fw-semibold mb-1">Asistencia</label>
                <CFormSelect v-model="filters.estado">
                  <option value="">Todos</option>
                  <option value="A">Asistencia Normal</option>
                  <option value="TL">Tardanza Leve</option>
                  <option value="TM">Tardanza Moderada</option>
                  <option value="TG">Tardanza Grave</option>
                  <option value="TE">Tardanza Extrema</option>
                  <option value="FI">Falta Injustificada</option>
                  <option value="FJ">Falta Justificada</option>
                </CFormSelect>
              </CCol>

              <CCol xs="6" md="auto">
                <CButton color="primary" class="w-100" @click="buscar">
                  Buscar
                </CButton>
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

    <CRow>
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell assist-table-tight list-with-pagination-wrap">
              <CTable hover responsive align="middle" class="mb-0">
                <CTableHead color="info" class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-white text-center">Fecha</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Hora</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center" style="width: 5rem">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="!asistencias.length">
                    <CTableRow>
                      <CTableDataCell colspan="4" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in asistencias" :key="item.id" class="align-middle">
                      <CTableDataCell class="text-center fw-medium">
                        {{ formatDate(item.fecha_hora) }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center fw-medium">
                        {{ esFaltaSinHora(item.estado) ? '—' : formatTime(item.fecha_hora) }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado(item.estado)" class="assist-badge-sm">
                          {{ textoEstado(item.estado) }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <i
                          class="fas fa-eye text-primary"
                          style="cursor: pointer; font-size: 16px"
                          v-c-tooltip="{ content: 'Ver detalle', placement: 'top' }"
                          @click="openDetail(item)"
                        ></i>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>

              <TablePagination
                :model-value="currentPage"
                :total="totalCount"
                :page-size="pageSize"
                aria-label="Paginación del historial"
                @update:model-value="fetchAsistencias"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal :visible="detailVisible" alignment="center" @close="closeDetail">
      <CModalHeader>
        <CModalTitle>Detalle de modificación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="selectedItem" class="d-flex flex-column gap-3">
          <div>
            <div class="text-body-secondary small mb-1">Registro</div>
            <div class="fw-semibold">
              {{ formatDate(selectedItem.fecha_hora) }}
              ·
              {{ esFaltaSinHora(selectedItem.estado) ? '—' : formatTime(selectedItem.fecha_hora) }}
            </div>
            <div class="mt-1">
              <CBadge :class="colorEstado(selectedItem.estado)" class="assist-badge-sm">
                {{ textoEstado(selectedItem.estado) }}
              </CBadge>
            </div>
          </div>

          <div v-if="hasModification(selectedItem)" class="d-flex flex-column gap-2">
            <div>
              <div class="text-body-secondary small mb-1">Modificado por</div>
              <div class="fw-semibold">{{ selectedItem.modificado_por || '—' }}</div>
            </div>
            <div>
              <div class="text-body-secondary small mb-1">Modificado el</div>
              <div class="fw-semibold">
                {{ selectedItem.fecha_modificacion ? formatDate(selectedItem.fecha_modificacion) : '—' }}
              </div>
            </div>
            <div>
              <div class="text-body-secondary small mb-1">Motivo</div>
              <div class="fw-semibold detail-motivo">
                {{ selectedItem.motivo || 'Sin motivo registrado' }}
              </div>
            </div>
          </div>

          <div v-else class="text-body-secondary">
            Este registro no tiene modificaciones.
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="closeDetail">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </CContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import TablePagination from '@/components/academic/TablePagination.vue'
import { textoEstado, colorEstado, esFaltaSinHora } from '@/utils/utils'
import { formatDate, formatTime } from '@/utils/time'
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

const route = useRoute()
const router = useRouter()
const alumnoId = route.params.id

const filters = ref({
  desde: '',
  hasta: '',
  estado: '',
})

const alumno = ref({
  name: '',
  apellidos: '',
  grade: '',
  section: '',
})

const asistencias = ref([])
const currentPage = ref(1)
const pageSize = 15
const totalCount = ref(0)

const detailVisible = ref(false)
const selectedItem = ref(null)

const goBack = () => {
  router.push('/assistances/admin/list-alumnos')
}

const hasModification = (item) =>
  Boolean(item?.modificado_por || item?.fecha_modificacion || item?.motivo)

const openDetail = (item) => {
  selectedItem.value = item
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
  selectedItem.value = null
}

const buscar = () => {
  fetchAsistencias(1)
}

const limpiar = () => {
  filters.value.desde = ''
  filters.value.hasta = ''
  filters.value.estado = ''
  fetchAsistencias(1)
}

const fetchAlumno = async () => {
  try {
    const res = await AssistanceService.getVAdmin_AlumnoDetail(alumnoId)
    alumno.value = res.data
  } catch (error) {
    console.error('Error al obtener alumno:', error)
  }
}

const fetchAsistencias = async (page = 1) => {
  try {
    const params = {
      alumno_id: alumnoId,
      page,
      page_size: pageSize,
      desde: filters.value.desde,
      hasta: filters.value.hasta,
      estado: filters.value.estado,
    }

    const res = await AssistanceService.getVAdmin_HistorialByAlumno(params)
    asistencias.value = res.data.results || []
    totalCount.value = res.data.count || 0
    currentPage.value = page
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
  }
}

onMounted(() => {
  fetchAlumno()
  fetchAsistencias()
})
</script>

<style scoped>
.historial-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
}

.historial-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.historial-header__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--cui-primary, #321fdb);
}

.historial-header__back {
  flex-shrink: 0;
}

.historial-header__meta {
  padding-right: 0.25rem;
}

.detail-motivo {
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 767.98px) {
  .historial-header__title {
    font-size: 1.45rem;
  }

  .historial-header__back {
    padding-inline: 0.7rem;
  }
}

@media (min-width: 768px) {
  .historial-header__title {
    font-size: 1.5rem;
  }
}
</style>

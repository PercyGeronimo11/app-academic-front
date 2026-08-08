<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="detail-header">
              <div class="detail-header__top">
                <h4 class="detail-header__title">
                  Historial de Asistencias
                </h4>
                <CButton color="info" variant="outline" class="detail-header__action" @click="verReporte">
                  <i class="fas fa-eye me-1"></i>
                  Ver Reporte
                </CButton>
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

                <CCol xs="6" md="3">
                  <label class="form-label fw-semibold mb-1">Asistencia</label>
                  <CFormSelect v-model="filters.estado">
                    <option value="">Todos</option>
                    <option value="A">Asistió</option>
                    <option value="TL">Tardanza Leve</option>
                    <option value="TM">Tardanza Moderada</option>
                    <option value="TG">Tardanza Grave</option>
                    <option value="TE">Tardanza Extrema</option>
                    <option value="FI">Falta Injustificada</option>
                    <option value="FJ">Falta Justificada</option>
                  </CFormSelect>
                </CCol>

                <CCol xs="3" md="auto">
                  <CButton color="primary" class="w-100" @click="buscar">
                    Buscar
                  </CButton>
                </CCol>

                <CCol xs="3" md="auto">
                  <CButton color="secondary" variant="outline" class="w-100" @click="limpiar">
                    Limpiar
                  </CButton>
                </CCol>
              </CRow>
            </div>
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
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="!asistencias.length">
                    <CTableRow>
                      <CTableDataCell colspan="3" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in asistencias" :key="item.id || item.fecha_hora">
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
  </CContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import TablePagination from '@/components/academic/TablePagination.vue'
import { textoEstado, colorEstado, esFaltaSinHora } from '@/utils/utils'
import { formatDate, formatTime } from '@/utils/time'

const router = useRouter()
const asistencias = ref([])
const currentPage = ref(1)
const pageSize = 15
const totalCount = ref(0)

const filters = ref({
  desde: '',
  hasta: '',
  estado: '',
})

const fetchAsistencias = async (page = 1) => {
  try {
    const params = {
      page,
      page_size: pageSize,
      desde: filters.value.desde,
      hasta: filters.value.hasta,
      estado: filters.value.estado,
    }

    const res = await AssistanceService.getAlumnoReporteDetallado(params)
    asistencias.value = res.data.results || []
    totalCount.value = res.data.count || 0
    currentPage.value = page
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
    asistencias.value = []
    totalCount.value = 0
  }
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

const verReporte = () => {
  router.push('/assistances/alumno/reporte')
}

onMounted(() => {
  fetchAsistencias()
})
</script>

<style scoped>
.detail-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
}

.detail-header__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--cui-primary, #321fdb);
}

.detail-header__action {
  flex-shrink: 0;
}

@media (max-width: 767.98px) {
  .detail-header__title {
    font-size: 1.45rem;
  }
}

@media (min-width: 768px) {
  .detail-header__title {
    font-size: 1.5rem;
  }
}
</style>

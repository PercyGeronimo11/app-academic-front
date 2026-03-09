<template>
  <CContainer fluid>

    <!-- Header -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="d-flex justify-content-between align-items-center py-3 px-4">
            <!-- Información del historial -->
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <h4 class="fw-bold text-primary mb-0">
                  Historial de Asistencias
                </h4>
              </div>


            </div>

            <!-- Indicador visual -->
            <div class="d-flex align-items-center gap-3">
              <span class="me-2 text-success fw-semibold ">
                Actualizado hasta hoy <span
                  style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;"></span>
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Filtros -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody>

            <CRow class="align-items-end">

              <CCol md="3">
                <label class="form-label fw-semibold">Desde</label>
                <CFormInput type="date" v-model="filters.desde" />
              </CCol>

              <CCol md="3">
                <label class="form-label fw-semibold">Hasta</label>

                <CFormInput type="date" v-model="filters.hasta" />
              </CCol>

              <CCol md="3">
                <label class="form-label fw-semibold">Asistencia</label>
                <CFormSelect v-model="filters.estado">
                  <option value="">Todos</option>
                  <option value="A">Asistió</option>
                  <option value="T">Tardanza</option>
                  <option value="F">Falta</option>
                </CFormSelect>
              </CCol>

              <CCol md="3" class="d-flex gap-2">
                <CButton color="primary" @click="buscar">
                  Buscar
                </CButton>

                <CButton color="secondary" variant="outline" @click="limpiar">
                  Limpiar
                </CButton>
              </CCol>

            </CRow>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla -->
    <CRow>
      <CCol>
        <CCard class="shadow border-0">
          <CCardBody>

            <CTable hover responsive align="middle" class="text-center border">

              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell>Hora</CTableHeaderCell>
                  <CTableHeaderCell>Asistencia</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(item, index) in asistencias" :key="index">

                  <CTableDataCell class="text-center fw-medium">{{ formatDate(item.fecha) }}</CTableDataCell>

                  <CTableDataCell>{{ item.hora }}</CTableDataCell>

                  <CTableDataCell>

                    <CBadge :color="getBadgeColor(item.estado)" class="px-3 py-1 fw-semibold" shape="rounded-pill">
                      {{ getBadgeText(item.estado) }}
                    </CBadge>

                  </CTableDataCell>

                </CTableRow>
              </CTableBody>

            </CTable>

            <!-- Paginación -->
            <div class="d-flex justify-content-between align-items-center mt-4 p-2 ">
              <CButton color="primary" variant="outline" :disabled="!previousPage"
                @click="fetchAsistencias(currentPage - 1)" class="d-flex align-items-center gap-2">
                <i class="fas fa-chevron-left"></i>
                Anterior
              </CButton>

              <div class="text-center fw-semibold text-muted">
                <i class="fas fa-file-alt me-1"></i>
                Página <span class="text-dark">{{ currentPage }}</span>
                /
                <span class="text-dark">{{ totalPages }}</span>
              </div>

              <CButton color="primary" variant="outline" :disabled="!nextPage"
                @click="fetchAsistencias(currentPage + 1)" class="d-flex align-items-center gap-2">
                Siguiente
                <i class="fas fa-chevron-right"></i>
              </CButton>
            </div>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

  </CContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '../../../services/AssistanceService'

const asistencias = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const nextPage = ref(null)
const previousPage = ref(null)

const filters = ref({
  desde: '',
  hasta: '',
  estado: ''
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const fetchAsistencias = async (page = 1) => {
  try {

    const params = {
      page,
      desde: filters.value.desde,
      hasta: filters.value.hasta,
      estado: filters.value.estado
    }

    const res = await AssistanceService.getAlumnoReporteDetallado(params)

    asistencias.value = res.data.results

    currentPage.value = page
    totalPages.value = Math.ceil(res.data.count / 20)

    nextPage.value = res.data.next
    previousPage.value = res.data.previous

  } catch (error) {
    console.error('Error al obtener asistencias:', error)
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

const getBadgeText = (estado) => {
  if (estado === 'A') return 'Asistió'
  if (estado === 'T') return 'Tardanza'
  if (estado === 'F') return 'Faltó'
  return estado
}

const getBadgeColor = (estado) => {
  if (estado === 'A') return 'success'
  if (estado === 'T') return 'warning'
  if (estado === 'F') return 'danger'
  return 'secondary'
}

onMounted(() => {
  fetchAsistencias()
})
</script>
<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="d-flex justify-content-between align-items-center py-3 px-4">

            <!-- Información del historial -->
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <a href="#" @click.prevent="$router.back()" class="text-decoration-underline text-primary">
                  <i class="fas fa-arrow-left"></i>
                </a>

                <h4 class="fw-bold text-primary mb-0">
                  Historial de Asistencias
                </h4>
              </div>

              <div class="text-secondary fw-semibold ms-4">
                <span class="me-3">
                  <i class="fas fa-user-graduate me-1"></i>
                  Alumno:
                  <strong>{{ alumno.name }} {{ alumno.apellidos }}</strong>
                </span>
              </div>
            </div>

            <!-- Indicador visual -->
            <div class="d-flex align-items-center gap-3">
              <CBadge color="dark" class="px-3 py-2 fs-6">
                Grado: <strong>{{ alumno.grade }}° {{ alumno.section }} </strong>
              </CBadge>
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
    <!-- Tabla de asistencias -->
    <CRow>
      <CCol>
        <CCard class="shadow-lg border-0">
          <CCardBody>
            <CTable hover responsive align="middle" class="text-center border">
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Hora</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Asistencia</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-for="(item, index) in asistencias" :key="index" class="align-middle">
                  <CTableDataCell class="text-center fw-medium"> {{  formatDate(item.fecha_hora) }}
                    </CTableDataCell>
                  <CTableDataCell class="text-center fw-medium">{{ item.estado === 'F' ? '--' : formatTime(item.fecha_hora) }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CBadge :color="colorEstado(item.estado)" class="px-3 py-1 fw-semibold" shape="rounded-pill">
                      {{ textoEstado(item.estado) }}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>

            <!-- Paginacion -->
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
import { useRoute, useRouter } from 'vue-router'
import AssistanceService from '../../../services/AssistanceService'
import { CBadge } from '@coreui/vue'
import { textoEstado, colorEstado, formatDate, formatTime } from '../../../utils/utils'

const route = useRoute()
const router = useRouter()
const alumnoId = route.params.id

const filters = ref({
  desde: '',
  hasta: '',
  estado: ''
})


const alumno = ref({
  name: '',
  apellidos: '',
  grade: '',
  section: ''
})

const asistencias = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const nextPage = ref(null)
const previousPage = ref(null)

const buscar = () => {
  fetchAsistencias(1)
}

const limpiar = () => {

  filters.value.desde = ''
  filters.value.hasta = ''
  filters.value.estado = ''

  fetchAsistencias(1)
}
// Traer datos del alumno (nombre, grado, sección)
const fetchAlumno = async () => {
  try {
    const res = await AssistanceService.getVAdmin_AlumnoDetail(alumnoId)
    alumno.value = res.data
  } catch (error) {
    console.error('Error al obtener alumno:', error)
  }
}

// Traer historial de asistencias paginado
const fetchAsistencias = async (page = 1) => {
  try {
    const params = {
      alumno_id: alumnoId,
      page,
      desde: filters.value.desde,
      hasta: filters.value.hasta,
      estado: filters.value.estado
    }

    const res = await AssistanceService.getVAdmin_HistorialByAlumno(params)

    asistencias.value = res.data.results

    currentPage.value = page
    totalPages.value = Math.ceil(res.data.count / 20)
    nextPage.value = res.data.next
    previousPage.value = res.data.previous
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
  }
}

onMounted(() => {
  fetchAlumno()
  fetchAsistencias()
})
</script>

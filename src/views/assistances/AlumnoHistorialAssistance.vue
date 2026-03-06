<template>
  <CContainer fluid>
    <!-- Header con info del alumno -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="bg-light">
            <h3 class="fw-bold text-primary">Historial de Asistencias</h3>
            <p class="text-secondary mb-0">
              Alumno: <strong>{{ alumno.nombres }} {{ alumno.apellidos }}</strong> |
              Grado: <strong>{{ alumno.grade }}</strong> |
              Sección: <strong>{{ alumno.section }}</strong>
            </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla de asistencias -->
    <CRow>
      <CCol>
        <CCard class="shadow-lg border-0">
          <CCardBody>
            <CTable hover responsive align="middle" bordered striped>
              <CTableHead color="primary" textColor="white">
                <CTableRow>
                  <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Hora</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Asistencia</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow
                  v-for="(item, index) in asistencias"
                  :key="index"
                  class="align-middle"
                >
                  <CTableDataCell class="text-center fw-medium">{{ item.fecha }}</CTableDataCell>
                  <CTableDataCell class="text-center fw-medium">{{ item.hora }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CBadge
                      :color="getBadgeColor(item.estado)"
                      class="px-3 py-1 fw-semibold"
                      shape="rounded-pill"
                    >
                      {{ getBadgeText(item.estado) }}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>

            <!-- Paginación -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <CButton
                color="secondary"
                :disabled="!previousPage"
                @click="fetchAsistencias(currentPage - 1)"
              >
                Anterior
              </CButton>

              <span class="fw-semibold text-muted">
                Página {{ currentPage }} / {{ totalPages }}
              </span>

              <CButton
                color="secondary"
                :disabled="!nextPage"
                @click="fetchAsistencias(currentPage + 1)"
              >
                Siguiente
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
import AssistanceService from '../../services/AssistanceService'
import { CBadge } from '@coreui/vue'

const route = useRoute()
const router = useRouter()
const alumnoId = route.params.id

const alumno = ref({
  nombres: '',
  apellidos: '',
  grade: '',
  section: ''
})

const asistencias = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const nextPage = ref(null)
const previousPage = ref(null)

// Traer datos del alumno (nombre, grado, sección)
const fetchAlumno = async () => {
  try {
    const res = await AssistanceService.getAlumnoDetail(alumnoId)
    alumno.value = res.data
  } catch (error) {
    console.error('Error al obtener alumno:', error)
  }
}

// Traer historial de asistencias paginado
const fetchAsistencias = async (page = 1) => {
  try {
    const res = await AssistanceService.getHistorialAsistencias(alumnoId, page)
    asistencias.value = res.data.results.map(item => ({
      fecha: item.fecha,
      hora: item.hora,
      estado: item.estado
    }))
    currentPage.value = page
    totalPages.value = Math.ceil(res.data.count / 20)
    nextPage.value = res.data.next
    previousPage.value = res.data.previous
  } catch (error) {
    console.error('Error al obtener asistencias:', error)
  }
}

// Mapear estado a texto bonito
const getBadgeText = (estado) => {
  if (estado === 'A') return 'Asistió'
  if (estado === 'T') return 'Tardanza'
  if (estado === 'F') return 'Faltó'
  return estado
}

// Mapear estado a color
const getBadgeColor = (estado) => {
  if (estado === 'A') return 'success'
  if (estado === 'T') return 'warning'
  if (estado === 'F') return 'danger'
  return 'secondary'
}

onMounted(() => {
  fetchAlumno()
  fetchAsistencias()
})
</script>











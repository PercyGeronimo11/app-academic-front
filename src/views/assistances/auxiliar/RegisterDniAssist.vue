<template>


  <CRow class="mb-2">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <div class="d-flex justify-content-between align-items-center">

            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Registrar asistencia manualmente
            </h5>
          </div>
        </CCardHeader>
      </CCard>
    </CCol>
  </CRow>

  <CRow class="mb-2">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardBody>
          <CRow class="g-2 align-items-center flex-md-nowrap">

            <!-- Buscar -->
            <CCol xs="12" md="4">
              <CFormInput placeholder="Buscar por apellido..." v-model="search" />
            </CCol>

            <!-- Grado -->
            <CCol xs="6" md="2">
              <CFormSelect v-model="selectedGrade">
                <option value="">Grado</option>
                <option v-for="g in grados" :key="g" :value="g">
                  {{ g }}
                </option>
              </CFormSelect>
            </CCol>

            <!-- Sección -->
            <CCol xs="6" md="2">
              <CFormSelect v-model="selectedSection">
                <option value="">Sección</option>
                <option v-for="s in secciones" :key="s" :value="s">
                  {{ s }}
                </option>
              </CFormSelect>
            </CCol>

            <!-- Botones -->
            <CCol xs="12" md="3" class="d-flex gap-2">
              <CButton color="primary" class="flex-fill" @click="fetchAlumnos(1)">
                Buscar
              </CButton>

              <CButton color="secondary" variant="outline" class="flex-fill" @click="limpiar">
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
          <div class="modern-table-shell">
            <CTable hover responsive align="middle" class="mb-0 text-center">

              <CTableHead class="modern-table-header text-center">
                <CTableRow>
                  <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Apellidos</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Nombres</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Grado </CTableHeaderCell>
                  <CTableHeaderCell class="text-center"> Sección</CTableHeaderCell>
                  <CTableHeaderCell class="text-center"> Asistencia</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <template v-if="!alumnos.length">
                  <CTableRow>
                    <CTableDataCell colspan="7" class="list-empty-message py-4">
                      No hay registros para mostrar.
                    </CTableDataCell>
                  </CTableRow>
                </template>
                <template v-else>
                  <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                    <CTableDataCell>{{ (currentPage - 1) * pageSize + index + 1 }}</CTableDataCell>
                    <CTableDataCell class="fw-semibold text-left">{{ alumno.apellidos }}</CTableDataCell>
                    <CTableDataCell class="text-left">{{ alumno.nombres }}</CTableDataCell>
                    <CTableDataCell class="text-center">{{ alumno.grade }}° </CTableDataCell>
                    <CTableDataCell class="text-center"> {{ alumno.section }} </CTableDataCell>

                    <CTableDataCell class="text-center">
                      <CBadge :class="colorEstado(alumno.asistencia_estado)">
                        {{ textoEstado(alumno.asistencia_estado) }}
                      </CBadge>
                    </CTableDataCell>

                    <CTableDataCell class="text-center">
                      <i class="fas fa-user-check"
                        :class="alumno.asistencia_estado === 'F' ? 'text-success' : 'text-secondary'" :style="{
                          cursor: alumno.asistencia_estado === 'F' ? 'pointer' : 'not-allowed',
                          fontSize: '16px',
                          opacity: alumno.asistencia_estado === 'F' ? 1 : 0.5
                        }" @click="abrirModalAsistencia(alumno)"></i>

                    </CTableDataCell>
                  </CTableRow>
                </template>
              </CTableBody>

            </CTable>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4 p-2 px-3">
            <CButton color="primary" variant="outline" :disabled="!previousPage" @click="fetchAlumnos(currentPage - 1)"
              class="d-flex align-items-center gap-2">
              <i class="fas fa-chevron-left"></i>
              Anterior
            </CButton>

            <div class="text-center fw-semibold text-muted">
              <i class="fas fa-file-alt me-1"></i>
              Página <span class="text-dark">{{ currentPage }}</span>
              /
              <span class="text-dark">{{ totalPages }}</span>
            </div>

            <CButton color="primary" variant="outline" :disabled="!nextPage" @click="fetchAlumnos(currentPage + 1)"
              class="d-flex align-items-center gap-2">
              Siguiente
              <i class="fas fa-chevron-right"></i>
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <CModal :visible="modalAsistencia" @close="modalAsistencia = false">
    <CModalHeader>
      <CModalTitle class="fw-bold text-success">
        <i class="fas fa-user-check me-2"></i>
        Confirmar registro de asistencia
      </CModalTitle>
    </CModalHeader>

    <CModalBody v-if="alumnoSeleccionado">

      <div class="text-center mb-3">
        <i class="fas fa-user-check text-success" style="font-size:40px"></i>
      </div>

      <p class="text-center text-muted mb-4">
        ¿Estás seguro de registrar asistencia para este alumno?
      </p>

      <div class="bg-light rounded p-3">

        <div class="mb-2">
          <strong>
            <i class="fas fa-user text-primary me-1"></i>
            Alumno:
          </strong>
          {{ alumnoSeleccionado.nombres }} {{ alumnoSeleccionado.apellidos }}
        </div>

        <div class="mb-2">
          <strong>
            <i class="fas fa-graduation-cap text-primary me-1"></i>
            Grado:
          </strong>
          {{ alumnoSeleccionado.grade }}°
        </div>

        <div>
          <strong>
            <i class="fas fa-layer-group text-primary me-1"></i>
            Sección:
          </strong>
          {{ alumnoSeleccionado.section }}
        </div>

      </div>

    </CModalBody>

    <CModalFooter>

      <CButton color="secondary" @click="modalAsistencia = false">
        <i class="fas fa-times me-1"></i>
        Cancelar
      </CButton>

      <CButton color="success" @click="registrarAsistencia">
        <i class="fas fa-check me-1"></i>
        Confirmar asistencia
      </CButton>

    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { textoEstado, colorEstado } from '@/utils/utils'
import { toastError, toastSuccess } from '../../../utils/alerts'
import Swal from 'sweetalert2'


const alumnos = ref([])
const search = ref('')
const selectedGrade = ref('')
const selectedSection = ref('')
const grados = ref(['1', '2', '3', '4', '5'])
const secciones = ref(['A', 'B', 'C', 'D'])



const modalAsistencia = ref(false)
const alumnoSeleccionado = ref(null)


const currentPage = ref(1)
const pageSize = 20
const nextPage = ref(null)
const previousPage = ref(null)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// --- Función para obtener alumnos paginados desde API
const fetchAlumnos = async (page = 1) => {
  try {
    const params = {
      page: page,
      search: search.value,
      grade: selectedGrade.value,
      section: selectedSection.value
    }
    const res = await AssistanceService.getVAuxiliar_listarAlumnos(params)
    alumnos.value = res.data.results
    nextPage.value = res.data.next
    previousPage.value = res.data.previous
    totalCount.value = res.data.count
    currentPage.value = page
  } catch (error) {
    console.error(error)
  }
}



const abrirModalAsistencia = async (alumno) => {

  if (alumno.asistencia_estado === 'A' || alumno.asistencia_estado === 'T') {
    return
  }

  const result = await Swal.fire({
    title: 'Registrar asistencia',
    html: `
      <div style="text-align:left">
        <p><b>Alumno:</b> ${alumno.nombres} ${alumno.apellidos}</p>
        <p><b>Grado:</b> ${alumno.grade}°</p>
        <p><b>Sección:</b> ${alumno.section}</p>
      </div>
      <p style="margin-top:10px">¿Deseas registrar la asistencia?</p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, registrar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d'
  })

  if (result.isConfirmed) {
    registrarAsistencia(alumno)
  }
}

const registrarAsistencia = async (alumno) => {

  try {

    await AssistanceService.VAuxiliar_registrarAsistencia(alumno.student_code)

    toastSuccess(`Se registró la asistencia de ${alumno.nombres}`)

    fetchAlumnos(currentPage.value)

  } catch (error) {
    const mensaje = error.response?.data?.mensaje || 'Error al registrar asistencia'
    toastError(mensaje)

  }

}


const limpiar = () => {
  search.value = ''
  selectedGrade.value = ''
  selectedSection.value = ''

  fetchAlumnos(1)
}

onMounted(() => {
  fetchAlumnos()
})
</script>

<style scoped>

.bg-orange-1 {
  background-color: #eed306; 
}

.bg-orange-2 {
  background-color: #ffb300;
}

.bg-orange-3 {
  background-color: #fd841a;
}

.bg-orange-4 {
  background-color: #fa6736;
}
.wrap-text {
  white-space: normal !important;  /* permite salto */
  line-height: 1.2;
}
</style>

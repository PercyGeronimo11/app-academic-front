<template>
  <CRow v-if="!embedded" class="mb-2">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <h5 class="fw-bold text-primary mb-0">
            <i class="fas fa-user-check me-2"></i>
            Registrar asistencia manualmente
          </h5>
        </CCardHeader>
      </CCard>
    </CCol>
  </CRow>

  <Teleport v-if="embedded" to="#assist-register-filters">
    <CRow class="g-2 align-items-end mt-1">
      <CCol xs="12" md="4">
        <CFormInput v-model="search" placeholder="Buscar por apellido..." />
      </CCol>
      <CCol xs="6" md="2">
        <CFormSelect v-model="selectedGrade">
          <option value="">Grado</option>
          <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
        </CFormSelect>
      </CCol>
      <CCol xs="6" md="2">
        <CFormSelect v-model="selectedSection">
          <option value="">Sección</option>
          <option v-for="s in secciones" :key="s" :value="s">{{ s }}</option>
        </CFormSelect>
      </CCol>
      <CCol xs="12" md="4" class="d-flex gap-2">
        <CButton color="primary" class="flex-fill" @click="fetchAlumnos(1)">Buscar</CButton>
        <CButton color="info" variant="outline" class="flex-fill" @click="limpiar">Limpiar</CButton>
      </CCol>
    </CRow>
  </Teleport>

  <CRow v-else class="mb-2">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardBody>
          <CRow class="g-2 align-items-end">
            <CCol xs="12" md="4">
              <CFormInput v-model="search" placeholder="Buscar por apellido..." />
            </CCol>
            <CCol xs="6" md="2">
              <CFormSelect v-model="selectedGrade">
                <option value="">Grado</option>
                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
              </CFormSelect>
            </CCol>
            <CCol xs="6" md="2">
              <CFormSelect v-model="selectedSection">
                <option value="">Sección</option>
                <option v-for="s in secciones" :key="s" :value="s">{{ s }}</option>
              </CFormSelect>
            </CCol>
            <CCol xs="12" md="4" class="d-flex gap-2">
              <CButton color="primary" class="flex-fill" @click="fetchAlumnos(1)">Buscar</CButton>
              <CButton color="info" variant="outline" class="flex-fill" @click="limpiar">Limpiar</CButton>
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
          <div class="modern-table-shell list-with-pagination-wrap">
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
                  <CTableHeaderCell class="text-white text-center">Asistencia</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center">Acciones</CTableHeaderCell>
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
                    <CTableDataCell class="text-center d-none d-md-table-cell">
                      {{ (currentPage - 1) * pageSize + index + 1 }}
                    </CTableDataCell>
                    <CTableDataCell class="fw-semibold text-start d-none d-md-table-cell">
                      {{ alumno.apellidos }}
                    </CTableDataCell>
                    <CTableDataCell class="text-start d-none d-md-table-cell">
                      {{ alumno.nombres }}
                    </CTableDataCell>
                    <CTableDataCell class="d-md-none text-start">
                      <div class="assist-name-stack">
                        <span class="assist-name-surnames">{{ alumno.apellidos }}</span>
                        <span class="assist-name-given">{{ alumno.nombres }}</span>
                        <span class="assist-name-aula">{{ alumno.grade }}° {{ alumno.section }}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-none d-md-table-cell">
                      {{ alumno.grade }}° {{ alumno.section }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <CBadge :class="colorEstado(alumno.asistencia_estado)">
                        {{ textoEstado(alumno.asistencia_estado) }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <CButton
                        size="sm"
                        color="success"
                        class="text-white"
                        :disabled="!esFaltaInjustificada(alumno.asistencia_estado)"
                        title="Registrar asistencia"
                        @click="abrirModalAsistencia(alumno)"
                      >
                        <i class="fas fa-clipboard-check me-1"></i>
                        Registrar
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
              aria-label="Paginación de alumnos"
              @update:model-value="fetchAlumnos"
            />
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import TablePagination from '@/components/academic/TablePagination.vue'
import { textoEstado, colorEstado, esFaltaInjustificada } from '@/utils/utils'
import { toastError, toastSuccess } from '@/utils/alerts'
import Swal from 'sweetalert2'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const alumnos = ref([])
const search = ref('')
const selectedGrade = ref('')
const selectedSection = ref('')
const grados = ref(['1', '2', '3', '4', '5'])
const secciones = ref(['A', 'B', 'C', 'D'])

const currentPage = ref(1)
const pageSize = 15
const totalCount = ref(0)

const fetchAlumnos = async (page = 1) => {
  try {
    const params = {
      page,
      page_size: pageSize,
      search: search.value,
      grade: selectedGrade.value,
      section: selectedSection.value,
    }
    const res = await AssistanceService.getVAuxiliar_listarAlumnos(params)
    alumnos.value = res.data.results || []
    totalCount.value = res.data.count || 0
    currentPage.value = page
  } catch (error) {
    console.error(error)
    toastError('No se pudo cargar la lista de alumnos.')
  }
}

const abrirModalAsistencia = async (alumno) => {
  if (!esFaltaInjustificada(alumno.asistencia_estado)) {
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
    cancelButtonColor: '#6c757d',
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
  color: var(--cui-body-color, #212529);
}

.assist-name-given {
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--cui-secondary-color, #6c757d);
}

.assist-name-aula {
  font-weight: 400;
  font-size: 0.75rem;
  color: var(--cui-secondary-color, #6c757d);
}
</style>

<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <h5 class="fw-bold text-primary mb-0">
            <i class="fas fa-chart-line me-2"></i>
            Reporte total por alumno
          </h5>
        </CCardHeader>

        <CCardBody class="pt-0 pb-3 px-3">
          <div class="mt-3">
            <CRow class="g-2 align-items-stretch">
              <CCol xs="12" md="4">
                <CFormInput
                  v-model="search"
                  placeholder="Buscar por apellido..."
                  class="h-100"
                  @keyup.enter="fetchAlumnos(1)"
                />
              </CCol>

              <CCol xs="6" md="2">
                <CFormSelect v-model="selectedGrade" class="h-100">
                  <option value="">Grado</option>
                  <option v-for="g in grados" :key="g" :value="g">
                    {{ g }}
                  </option>
                </CFormSelect>
              </CCol>

              <CCol xs="6" md="2">
                <CFormSelect v-model="selectedSection" class="h-100">
                  <option value="">Sección</option>
                  <option v-for="s in secciones" :key="s" :value="s">
                    {{ s }}
                  </option>
                </CFormSelect>
              </CCol>

              <CCol xs="6" md="2">
                <CButton color="primary" class="w-100 h-100" @click="fetchAlumnos(1)">
                  Buscar
                </CButton>
              </CCol>

              <CCol xs="6" md="2">
                <CButton color="secondary" variant="outline" class="w-100 h-100" @click="limpiar">
                  Limpiar
                </CButton>
              </CCol>
            </CRow>
          </div>
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
                  <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell" style="width: 3rem">
                    N°
                  </CTableHeaderCell>
                  <CTableHeaderCell class="text-white d-none d-lg-table-cell">Apellidos</CTableHeaderCell>
                  <CTableHeaderCell class="text-white d-none d-lg-table-cell">Nombres</CTableHeaderCell>
                  <CTableHeaderCell class="text-white d-lg-none text-start">Alumno</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center">Grado</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center">Asist.</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center d-none d-xl-table-cell">Tard. Leve</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center d-none d-xl-table-cell">Tard. Moderada</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center d-none d-xl-table-cell">Tard. Grave</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center d-none d-xl-table-cell">Tard. Extrema</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center d-xl-none">Tard.</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center">Faltas</CTableHeaderCell>
                  <CTableHeaderCell class="text-white text-center">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <template v-if="!alumnos.length">
                  <CTableRow>
                    <CTableDataCell colspan="12" class="list-empty-message py-4">
                      No hay registros para mostrar.
                    </CTableDataCell>
                  </CTableRow>
                </template>
                <template v-else>
                  <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                    <CTableDataCell class="text-center d-none d-lg-table-cell">
                      {{ (currentPage - 1) * pageSize + index + 1 }}
                    </CTableDataCell>

                    <CTableDataCell class="fw-semibold d-none d-lg-table-cell text-start">
                      {{ alumno.surname_father }} {{ alumno.surname_mother }}
                    </CTableDataCell>
                    <CTableDataCell class="d-none d-lg-table-cell text-start">
                      {{ alumno.nombres }}
                    </CTableDataCell>

                    <CTableDataCell class="d-lg-none text-start">
                      <div class="assist-name-stack">
                        <span class="assist-name-surnames">
                          {{ alumno.surname_father }} {{ alumno.surname_mother }}
                        </span>
                        <span class="assist-name-given">{{ alumno.nombres }}</span>
                      </div>
                    </CTableDataCell>

                    <CTableDataCell class="text-center fw-semibold">
                      {{ alumno.grade }}° {{ alumno.section }}
                    </CTableDataCell>

                    <CTableDataCell class="text-center">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.ASISTENCIA)" class="assist-badge-sm">
                        {{ alumno.t_asistencias }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-none d-xl-table-cell">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE)" class="assist-badge-sm">
                        {{ alumno.t_tardanza_leve }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-none d-xl-table-cell">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA)" class="assist-badge-sm">
                        {{ alumno.t_tardanza_moderada }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-none d-xl-table-cell">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE)" class="assist-badge-sm">
                        {{ alumno.t_tardanza_grave }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-none d-xl-table-cell">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA)" class="assist-badge-sm">
                        {{ alumno.t_tardanza_extrema }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center d-xl-none">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA)" class="assist-badge-sm">
                        {{ totalTardanzasAlumno(alumno) }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <CBadge :class="colorEstado(ESTADOS_ASISTENCIA.FALTA)" class="assist-badge-sm">
                        {{ alumno.t_faltas }}
                      </CBadge>
                    </CTableDataCell>

                    <CTableDataCell class="text-center text-nowrap">
                      <i
                        class="fas fa-eye text-primary mx-1"
                        style="cursor: pointer; font-size: 16px"
                        v-c-tooltip="{ content: 'Ver detalle', placement: 'top' }"
                        @click="verDetalle(alumno)"
                      ></i>
                      <i
                        class="fas fa-chart-line text-success mx-1"
                        style="cursor: pointer; font-size: 16px"
                        v-c-tooltip="{ content: 'Ver gráfico', placement: 'top' }"
                        @click="verDashboard(alumno)"
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
import { useRouter } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import { exportarExcel } from '@/utils/exportExcel'
import { colorEstado, ESTADOS_ASISTENCIA } from '@/utils/utils'
import TablePagination from '@/components/academic/TablePagination.vue'

const router = useRouter()

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
    const res = await AssistanceService.listarAlumnos(params)
    alumnos.value = res.data.results || []
    totalCount.value = res.data.count || 0
    currentPage.value = page
  } catch (error) {
    console.error(error)
  }
}

const limpiar = () => {
  search.value = ''
  selectedGrade.value = ''
  selectedSection.value = ''
  fetchAlumnos(1)
}

const totalTardanzasAlumno = (alumno) =>
  Number(alumno.t_tardanza_leve || 0) +
  Number(alumno.t_tardanza_moderada || 0) +
  Number(alumno.t_tardanza_grave || 0) +
  Number(alumno.t_tardanza_extrema || 0)

const verDetalle = (alumno) => {
  router.push(`/assistances/admin/detail-alumno/${alumno.id}`)
}

const verDashboard = (alumno) => {
  router.push(`/assistances/admin/dashboard-alumno/${alumno.id}`)
}

const descargarExcel = async () => {
  const params = {
    search: search.value,
    grade: selectedGrade.value,
    section: selectedSection.value,
  }
  const resp = await AssistanceService.listarAlumnosExportExcel(params)
  const alumnosReport = resp.data || []

  exportarExcel({
    fileName: 'reporte_alumnos.xlsx',
    sheetName: 'reporte',
    data: alumnosReport,
    columns: [
      { header: 'Apellidos', key: 'apellidos', width: 20 },
      { header: 'Nombres', key: 'nombres', width: 15 },
      { header: 'Grado', key: 'grade', width: 15 },
      { header: 'Seccion', key: 'section', width: 15 },
      { header: 'Asistencias', key: 'total_asistencias', width: 15 },
      { header: 'Tardanzas', key: 'total_tardanzas', width: 15 },
      { header: 'Faltas', key: 'total_faltas', width: 12 },
      { header: 'Faltas Injustificadas', key: 'total_faltas_injustificadas', width: 18 },
      { header: 'Faltas Justificadas', key: 'total_faltas_justificadas', width: 18 },
    ],
  })
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
</style>

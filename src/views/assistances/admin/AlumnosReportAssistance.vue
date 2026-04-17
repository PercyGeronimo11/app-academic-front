<template>
    <CRow class="mb-3">
        <CCol>
            <CCard class="shadow-sm border-0">
                <CCardHeader class="bg-white border-bottom py-3">

                    <!-- Header -->
                    <div
                        class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">

                        <h5 class="fw-bold text-primary mb-0">
                            <i class="fas fa-chart-line me-2"></i>
                            Reporte total por alumno
                        </h5>

                        <div class="d-flex align-items-center">
                            <span class="me-2 text-success fw-semibold">
                                Actualizado hasta hoy
                            </span>
                            <span
                                style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;">
                            </span>
                        </div>

                    </div>
                </CCardHeader>
                <CCardBody class="pt-0 pb-3 px-3">
                    <!-- Filtros -->
                    <div class="mt-3">
                        <CRow class="g-2 align-items-stretch">

                            <!-- Buscar -->
                            <CCol xs="12" md="4">
                                <CFormInput placeholder="Buscar por apellido..." v-model="search"
                                    @keyup.enter="fetchAlumnos(1)" class="h-100" />
                            </CCol>

                            <!-- Grado -->
                            <CCol xs="6" md="2">
                                <CFormSelect v-model="selectedGrade" class="h-100">
                                    <option value="">Grado</option>
                                    <option v-for="g in grados" :key="g" :value="g">
                                        {{ g }}
                                    </option>
                                </CFormSelect>
                            </CCol>

                            <!-- Sección -->
                            <CCol xs="6" md="2">
                                <CFormSelect v-model="selectedSection" class="h-100">
                                    <option value="">Sección</option>
                                    <option v-for="s in secciones" :key="s" :value="s">
                                        {{ s }}
                                    </option>
                                </CFormSelect>
                            </CCol>

                            <!-- Botones -->
                            <CCol xs="12" md="4">
                                <div class="d-flex flex-column flex-md-row gap-2 h-100">
                                    <CButton color="primary" class="flex-fill" @click="fetchAlumnos(1)">
                                        Buscar
                                    </CButton>

                                    <CButton color="secondary" variant="outline" class="flex-fill" @click="limpiar">
                                        Limpiar
                                    </CButton>
                                </div>
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
                    <div class="modern-table-shell">
                    <CTable hover responsive align="middle" class="mb-0 text-center">
                        <CTableHead class="modern-table-header text-center">
                            <CTableRow>
                                <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Apellido Paterno</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Apellido Materno</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Nombres</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Grado</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Sección</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Asistencias</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Tard. Leve</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Tard. Moderada</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Tard. Grave</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Tard. Extrema</CTableHeaderCell>
                                <CTableHeaderCell class="text-center"> Faltas</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            <template v-if="!alumnos.length">
                                <CTableRow>
                                    <CTableDataCell colspan="9" class="list-empty-message py-4">
                                        No hay registros para mostrar.
                                    </CTableDataCell>
                                </CTableRow>
                            </template>
                            <template v-else>
                                <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                                    <CTableDataCell>{{ (currentPage - 1) * pageSize + index + 1 }}</CTableDataCell>
                                    <CTableDataCell class="fw-semibold">{{ alumno.surname_father }}</CTableDataCell>
                                    <CTableDataCell class="fw-semibold">{{ alumno.surname_mother }}</CTableDataCell>
                                    <CTableDataCell>{{ alumno.nombres }}</CTableDataCell>
                                    <CTableDataCell class="text-center">{{ alumno.grade }}°
                                    </CTableDataCell>
                                    <CTableDataCell class="text-center">{{ alumno.section }}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.ASISTENCIA)>{{ alumno.t_asistencias }}
                                        </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.TARDANZA_LEVE)>{{ alumno.t_tardanza_leve }}
                                        </CBadge>
                                    </CTableDataCell>
                                      <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA)>{{ alumno.t_tardanza_moderada }}
                                        </CBadge>
                                    </CTableDataCell>
                                      <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.TARDANZA_GRAVE)>{{ alumno.t_tardanza_grave }}
                                        </CBadge>
                                    </CTableDataCell>
                                      <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.TARDANZA_EXTREMA)>{{ alumno.t_tardanza_extrema }}
                                        </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CBadge :class = colorEstado(ESTADOS_ASISTENCIA.FALTA)>{{ alumno.t_faltas }}
                                        </CBadge>
                                    </CTableDataCell>

                                    <CTableDataCell class="text-center">
                                        <i class="fas fa-eye text-primary mx-2" style="cursor:pointer; font-size:16px"
                                            v-c-tooltip="{
                                                content: 'Ver detalle',
                                                placement: 'top'
                                            }" @click="verDetalle(alumno)"></i>

                                        <i class="fas fa-chart-line text-success mx-2"
                                            style="cursor:pointer; font-size:16px" v-c-tooltip="{
                                                content: 'Ver gráfico',
                                                placement: 'top'
                                            }" @click="verDashboard(alumno)"></i>

                                    </CTableDataCell>
                                </CTableRow>
                            </template>
                        </CTableBody>

                    </CTable>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-4 p-2 px-3">
                        <CButton color="primary" variant="outline" :disabled="!previousPage"
                            @click="fetchAlumnos(currentPage - 1)" class="d-flex align-items-center gap-2">
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
                            @click="fetchAlumnos(currentPage + 1)" class="d-flex align-items-center gap-2">
                            Siguiente
                            <i class="fas fa-chevron-right"></i>
                        </CButton>
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import { exportarExcel } from '@/utils/exportExcel'
import { colorEstado, ESTADOS_ASISTENCIA } from '@/utils/utils'

const router = useRouter()

const alumnos = ref([])
const search = ref('')
const selectedGrade = ref('')
const selectedSection = ref('')
const grados = ref(['1', '2', '3', '4', '5'])
const secciones = ref(['A', 'B', 'C', 'D'])


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
        const res = await AssistanceService.listarAlumnos(params)
        alumnos.value = res.data.results
        nextPage.value = res.data.next
        previousPage.value = res.data.previous
        totalCount.value = res.data.count
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

const verDetalle = (alumno) => {
    router.push(`/assistances/admin/detail-alumno/${alumno.id}`)
}

const verDashboard = (alumno) => {
    router.push(`/assistances/admin/dashboard-alumno/${alumno.id}`)
}

const descargarExcel = async () => {
    const alumnosReport = ref([])
    const params = {
        search: search.value,
        grade: selectedGrade.value,
        section: selectedSection.value
    }
    const resp = await AssistanceService.listarAlumnosExportExcel(params)
    alumnosReport.value = resp.data

    exportarExcel({
        fileName: 'reporte_alumnos.xlsx',
        sheetName: 'reporte',
        data: alumnosReport.value,
        columns: [
            { header: 'Apellidos', key: 'apellidos', width: 20 },
            { header: 'Nombres', key: 'nombres', width: 15 },
            { header: 'Grado', key: 'grade', width: 15 },
            { header: 'Seccion', key: 'section', width: 15 },
            { header: 'Asistencias', key: 'total_asistencias', width: 15 },
            { header: 'Tardanzas', key: 'total_tardanzas', width: 15 },
            { header: 'Faltas', key: 'total_faltas', width: 15 }
        ]
    })
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
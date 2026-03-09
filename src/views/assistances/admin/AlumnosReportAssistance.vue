<template>


    <CRow class="mb-3">
        <CCol>
            <CCard class="shadow-sm border-0">
                <CCardHeader class="bg-white border-bottom py-3">
                    <div class="d-flex justify-content-between align-items-center">

                        <h5 class="fw-bold text-primary mb-0">
                            <i class="fas fa-chart-line me-2"></i>
                            Reporte total de asistencias por alumno
                        </h5>

                        <div class="d-flex align-items-center">
                            <span class="me-2 text-success fw-semibold ">
                                Actualizado hasta hoy
                            </span>
                            <span
                                style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;"></span>
                        </div>
                    </div>
                </CCardHeader>
            </CCard>
        </CCol>
    </CRow>

    <CRow class="mb-3">
        <CCol>
            <CCard class="shadow-sm border-0">
                <CCardBody>
                    <CForm class="row gx-3 gy-2 align-items-center" @submit.prevent="fetchAlumnos(1)">
                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="searchInput">Apellido</CFormLabel>
                            <CFormInput id="searchInput" placeholder="Buscar por apellido..." v-model="search" />
                        </CCol>

                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="gradeSelect">Grado</CFormLabel>
                            <CFormSelect id="gradeSelect" v-model="selectedGrade">
                                <option value="">Todos los grados</option>
                                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
                            </CFormSelect>
                        </CCol>

                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="sectionSelect">Sección</CFormLabel>
                            <CFormSelect id="sectionSelect" v-model="selectedSection">
                                <option value="">Todas las secciones</option>
                                <option v-for="s in secciones" :key="s" :value="s">{{ s }}</option>
                            </CFormSelect>
                        </CCol>

                        <CCol xs="auto">
                            <CButton type="submit" color="primary">Buscar</CButton>
                        </CCol>
                    </CForm>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>

    <CRow class="mb-4">
        <CCol>
            <CCard class="shadow-sm border-0">
                <CCardBody>
                    <CTable hover responsive align="middle" class="mb-0 text-center">

                        <CTableHead color="light">
                            <CTableRow>
                                <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Apellidos</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Nombres</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Grado y Sección</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Total Asistencias</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Total Tardanzas</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Total Faltas</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                                <CTableDataCell>{{ (currentPage - 1) * pageSize + index + 1 }}</CTableDataCell>
                                <CTableDataCell class="fw-semibold">{{ alumno.apellidos }}</CTableDataCell>
                                <CTableDataCell>{{ alumno.nombres }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.grade }}° {{ alumno.section }}
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CBadge color="success" class="px-3 py-2 fs-6">{{ alumno.total_asistencias }}
                                    </CBadge>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CBadge color="warning" class="px-3 py-2 fs-6">{{ alumno.total_tardanzas }}</CBadge>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CBadge color="danger" class="px-3 py-2 fs-6">{{ alumno.total_faltas }}</CBadge>
                                </CTableDataCell>
                                <CTableDataCell class="text-center">
                                    <i class="fas fa-eye text-primary" style="cursor:pointer; font-size:16px"
                                        @click="verDetalle(alumno)"></i>
                                </CTableDataCell>
                            </CTableRow>
                        </CTableBody>

                    </CTable>

                    <div class="d-flex justify-content-between align-items-center mt-4 p-2 ">
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
        const res = await AssistanceService.listarAlumnos(page, search.value, selectedGrade.value, selectedSection.value)
        alumnos.value = res.data.results
        nextPage.value = res.data.next
        previousPage.value = res.data.previous
        totalCount.value = res.data.count
        currentPage.value = page
    } catch (error) {
        console.error(error)
    }
}

const verDetalle = (alumno) => {
    router.push(`/assistances/detail-alumno/${alumno.id}`)
}

onMounted(() => {
    fetchAlumnos()
})
</script>
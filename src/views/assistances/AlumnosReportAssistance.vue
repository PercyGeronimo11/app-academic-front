<template>


    <CRow class="mb-3">
        <CCol>
            <h3 class="fw-bold">Listado de Alumnos</h3>
        </CCol>
    </CRow>

    <CRow class="mb-3">
        <CCol :xs="12">
            <CCard class="mb-4">
                <CCardHeader>
                    <strong>Filtros de búsqueda</strong>
                </CCardHeader>
                <CCardBody>
                    <CForm class="row gx-3 gy-2 align-items-center" @submit.prevent="fetchAlumnos(1)">
                        <!-- Nombre/Apellido -->
                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="searchInput">Nombre o Apellido</CFormLabel>
                            <CFormInput id="searchInput" placeholder="Buscar por nombre o apellido" v-model="search" />
                        </CCol>

                        <!-- Grado -->
                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="gradeSelect">Grado</CFormLabel>
                            <CFormSelect id="gradeSelect" v-model="selectedGrade">
                                <option value="">Todos los grados</option>
                                <option v-for="g in grados" :key="g" :value="g">{{ g }}</option>
                            </CFormSelect>
                        </CCol>

                        <!-- Sección -->
                        <CCol xs="auto">
                            <CFormLabel class="visually-hidden" for="sectionSelect">Sección</CFormLabel>
                            <CFormSelect id="sectionSelect" v-model="selectedSection">
                                <option value="">Todas las secciones</option>
                                <option v-for="s in secciones" :key="s" :value="s">{{ s }}</option>
                            </CFormSelect>
                        </CCol>

                        <!-- Botón Buscar -->
                        <CCol xs="auto">
                            <CButton type="submit" color="primary">Buscar</CButton>
                        </CCol>
                    </CForm>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>

    <CRow>
        <CCol>
            <CCard class="shadow">
                <CCardBody>
                    <CTable hover responsive align="middle">

                        <CTableHead color="light">
                            <CTableRow>
                                <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Apellidos</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Nombres</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Grado</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Sección</CTableHeaderCell>
                               <CTableHeaderCell class="text-center">Total Asistencias</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Total Tardanzas</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Total Faltas</CTableHeaderCell>
                                <CTableHeaderCell class="text-center">Opciones</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                                <CTableDataCell>{{ (currentPage - 1) * pageSize + index + 1 }}</CTableDataCell>
                                <CTableDataCell class="fw-semibold">{{ alumno.apellidos }}</CTableDataCell>
                                <CTableDataCell>{{ alumno.nombres }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.grade }}°</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.section }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.total_asistencias }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.total_tardanzas }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ alumno.total_faltas }}</CTableDataCell>
                                <CTableDataCell class="text-center">
                                    <CButton color="light" size="sm" @click="verDetalle(alumno)">
                                        <i class="fas fa-eye"></i>
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        </CTableBody>

                    </CTable>

                    <!-- Paginación -->
                    <div class="d-flex justify-content-between mt-3">
                        <CButton color="secondary" :disabled="!previousPage" @click="fetchAlumnos(currentPage - 1)">
                            Anterior
                        </CButton>

                        <span>Página {{ currentPage }} / {{ totalPages }}</span>

                        <CButton color="secondary" :disabled="!nextPage" @click="fetchAlumnos(currentPage + 1)">
                            Siguiente
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
<template>
    <CContainer fluid>
        <CRow class="mb-4">
            <CCol>
                <CCard class="shadow-sm border-0">
                    <CCardBody class="d-flex justify-content-between align-items-center py-2 px-2">
                        <!-- Información -->
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <a href="#" @click.prevent="$router.back()"
                                    class="text-decoration-underline text-primary">
                                   <i class="fas fa-arrow-left"></i>
                                </a>
                                <h4 class="fw-bold text-primary mb-0">
                                    Registro de asistencias diarias
                                </h4>
                            </div>
                            <h5 class="text-muted fw-semibold mb-0 ms-4">
                                Grado: {{ gradoTexto(grado) }} - {{ seccion }}
                            </h5>
                        </div>

                        <!-- Fecha -->
                        <div class="d-flex align-items-center gap-3">
                            <CBadge color="dark" class="px-3 py-2 fs-6">
                                📅 {{ fecha_actual }}
                            </CBadge>
                        </div>

                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>

        <!-- Tabla -->
        <CRow>
            <CCol>

                <CCard class="shadow border-0">

                    <CCardHeader class="bg-white border-bottom py-3">
                        <div class="d-flex justify-content-between align-items-center">

                            <h5 class="fw-bold text-primary mb-0">
                                <i class="fas fa-chart-bar me-2"></i>
                                Lista de Alumnos
                            </h5>

                            <div class="d-flex align-items-center">
                                <CBadge color="primary" class="px-3 py-2 fs-6">
                                    {{ alumnos.length }} alumnos
                                </CBadge>
                            </div>
                        </div>
                    </CCardHeader>

                    <CCardBody>

                        <CTable hover responsive striped align="middle" class="text-center border">

                            <CTableHead color="dark">
                                <CTableRow>
                                    <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                                    <CTableHeaderCell class="text-center">Apellidos</CTableHeaderCell>
                                    <CTableHeaderCell class="text-center">Nombres</CTableHeaderCell>
                                    <CTableHeaderCell class="text-center">Asistencia</CTableHeaderCell>
                                    <CTableHeaderCell class="text-center">Hora</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                <template v-if="!alumnos.length">
                                    <CTableRow>
                                        <CTableDataCell colspan="5" class="list-empty-message py-4">
                                            No hay registros para mostrar.
                                        </CTableDataCell>
                                    </CTableRow>
                                </template>
                                <template v-else>
                                    <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">

                                        <CTableDataCell class="fw-semibold">{{ index + 1 }}</CTableDataCell>
                                        <CTableDataCell class="fw-semibold text-dark">{{ alumno.apellidos }}</CTableDataCell>
                                        <CTableDataCell>{{ alumno.nombre }}</CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge :color="colorEstado(alumno.estado)" class="px-3 py-2">
                                                {{ textoEstado(alumno.estado) }}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell class="text-center fw-medium">{{ alumno.estado === 'F' ? '--' : formatTime(alumno.hora) }}</CTableDataCell>

                                    </CTableRow>
                                </template>
                            </CTableBody>
                        </CTable>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>

    </CContainer>
</template>

<script setup>

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AssistanceService from '../../../services/AssistanceService'
import { formatTime, fecha_actual } from '@/utils/time'
import { textoEstado, colorEstado, gradoTexto } from '@/utils/utils'

const route = useRoute()
const seccionId = route.params.id
const grado = ref(null)
const seccion = ref(null)



const alumnos = ref([])
AssistanceService.getDetailAssistanceBySeccion(seccionId).then(response => {
    alumnos.value = response.data.alumnos
    grado.value = response.data.grade
    seccion.value = response.data.section
})



</script>

<template>
    <CContainer fluid>
        <CRow class="mb-4">
            <CCol>
                <CCard class="shadow-sm border-0">

                    <!-- 🔹 HEADER -->
                    <CCardHeader class="bg-white border-bottom py-3">
                        <div class="d-flex justify-content-between align-items-center">

                            <!-- Izquierda -->
                            <div class="d-flex align-items-center gap-3">
                                <a href="#" @click.prevent="$router.back()" class="text-primary fs-5">
                                    <i class="fas fa-arrow-left"></i>
                                </a>

                                <div>
                                    <h5 class="fw-bold text-primary mb-0">
                                        Detalle de asistencias por aula
                                    </h5>
                                    <small class="text-muted">
                                        Grado: {{ gradoTexto(grado) }} - {{ seccion }}
                                    </small>
                                </div>
                            </div>

                        </div>
                    </CCardHeader>

                    <!-- 🔸 BODY -->
                    <CCardBody class="d-flex justify-content-between align-items-center py-3 px-3">

                        <!-- Fecha -->
                        <CBadge color="dark" class="px-3 py-2 fs-6">
                            📅 {{ fecha_actual }}
                        </CBadge>

                        <!-- Cantidad -->
                        <CBadge color="primary" class="px-3 py-2 fs-6">
                            {{ alumnos.length }} alumnos
                        </CBadge>

                    </CCardBody>

                </CCard>
            </CCol>
        </CRow>

        <!-- Tabla -->
        <CRow>
            <CCol>
                <CCard class="shadow border-0">
                    <CCardBody class="p-0">
                        <div class="modern-table-shell">
                            <CTable hover responsive align="middle" class="mb-0 text-center">
                                <CTableHead class="modern-table-header text-center">
                                    <CTableRow>
                                        <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                                        <CTableHeaderCell class="text-center">Apell. Paterno</CTableHeaderCell>
                                        <CTableHeaderCell class="text-center">Apell. Materno</CTableHeaderCell>
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
                                            <CTableDataCell class="fw-semibold">{{ alumno.surname_father }}</CTableDataCell>
                                            <CTableDataCell class="fw-semibold">{{ alumno.surname_mother }}</CTableDataCell>
                                            <CTableDataCell>{{ alumno.nombre }}</CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge :class="colorEstado(alumno.estado)">
                                                    {{ textoEstado(alumno.estado) }}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell class="text-center fw-medium">{{ alumno.estado === 'F' ?
                                                '--' : formatTime(alumno.hora) }}</CTableDataCell>

                                        </CTableRow>
                                    </template>
                                </CTableBody>
                            </CTable>
                        </div>
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

<style>
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

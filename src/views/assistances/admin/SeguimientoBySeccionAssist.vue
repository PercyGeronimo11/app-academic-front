<template>
  <CContainer fluid class="px-0">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardHeader class="bg-white border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <div class="d-flex align-items-center gap-2 gap-md-3 min-w-0">
                <a href="#" @click.prevent="$router.back()" class="text-primary fs-5 flex-shrink-0">
                  <i class="fas fa-arrow-left"></i>
                </a>
                <div class="min-w-0">
                  <h5 class="fw-bold text-primary mb-0 text-truncate">
                    Detalle de asistencias por aula
                  </h5>
                  <small class="text-muted">
                    Grado: {{ gradoTexto(grado) }} - {{ seccion }}
                  </small>
                </div>
              </div>
            </div>
          </CCardHeader>

          <CCardBody class="d-flex justify-content-between align-items-center py-2 px-3 gap-2 flex-wrap">
            <CBadge color="dark" class="px-3 py-2">
              📅 {{ fecha_actual }}
            </CBadge>
            <CBadge color="primary" class="px-3 py-2">
              {{ alumnos.length }} alumnos
            </CBadge>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow>
      <CCol>
        <CCard class="shadow border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell assist-table-tight">
              <CTable hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-center d-none d-md-table-cell" style="width: 3rem">N°</CTableHeaderCell>
                    <CTableHeaderCell class="d-none d-md-table-cell">Apell. Paterno</CTableHeaderCell>
                    <CTableHeaderCell class="d-none d-md-table-cell">Apell. Materno</CTableHeaderCell>
                    <CTableHeaderCell class="d-none d-md-table-cell">Nombres</CTableHeaderCell>
                    <CTableHeaderCell class="d-md-none text-start">Alumno</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Asistencia</CTableHeaderCell>
                    <CTableHeaderCell class="text-center" style="width: 4.5rem">Hora</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="!alumnos.length">
                    <CTableRow>
                      <CTableDataCell colspan="6" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="(alumno, index) in alumnos" :key="alumno.id">
                      <CTableDataCell class="fw-semibold text-center d-none d-md-table-cell">
                        {{ index + 1 }}
                      </CTableDataCell>
                      <CTableDataCell class="fw-semibold d-none d-md-table-cell text-start">
                        {{ alumno.surname_father }}
                      </CTableDataCell>
                      <CTableDataCell class="fw-semibold d-none d-md-table-cell text-start">
                        {{ alumno.surname_mother }}
                      </CTableDataCell>
                      <CTableDataCell class="d-none d-md-table-cell text-start">
                        {{ alumno.nombre }}
                      </CTableDataCell>

                      <CTableDataCell class="d-md-none">
                        <div class="assist-name-stack">
                          <span class="assist-name-surnames">
                            {{ alumno.surname_father }} {{ alumno.surname_mother }}
                          </span>
                          <span class="assist-name-given">{{ alumno.nombre }}</span>
                        </div>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado(alumno.estado)" class="assist-badge-sm">
                          {{ textoEstado(alumno.estado) }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center fw-medium">
                        {{ alumno.estado === 'F' ? '--' : formatTime(alumno.hora) }}
                      </CTableDataCell>
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

AssistanceService.getDetailAssistanceBySeccion(seccionId).then((response) => {
  alumnos.value = response.data.alumnos
  grado.value = response.data.grade
  seccion.value = response.data.section
})
</script>
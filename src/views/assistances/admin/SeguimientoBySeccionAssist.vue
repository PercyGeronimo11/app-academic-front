<template>
  <CContainer fluid class="px-0">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="aula-header">
              <div class="aula-header__top">
                <h5 class="aula-header__title">
                  Detalle de asistencias por aula
                </h5>
                <CButton color="info" variant="outline" class="aula-header__back" @click="goBack">
                  <i class="fas fa-arrow-left me-1"></i>
                  Volver
                </CButton>
              </div>

              <div class="aula-header__meta">
                <div class="text-body mb-1">
                  Aula:
                  <span class="fw-semibold text-body">
                    {{ gradoTexto(grado) }} - {{ seccion || '—' }}
                  </span>
                </div>
                <div class="text-body-secondary mb-1">
                  Fecha hoy:
                  <span class="fw-semibold text-body">{{ fecha_actual }}</span>
                </div>
                <div class="text-body-secondary">
                  Alumnos:
                  <span class="fw-semibold text-body">{{ alumnos.length }}</span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow>
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
                    <CTableHeaderCell class="text-white d-none d-md-table-cell">Apell. Paterno</CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-none d-md-table-cell">Apell. Materno</CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-none d-md-table-cell">Nombres</CTableHeaderCell>
                    <CTableHeaderCell class="text-white d-md-none text-start">Alumno</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Asistencia</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center" style="width: 4.5rem">Hora</CTableHeaderCell>
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
                    <CTableRow v-for="(alumno, index) in pagedAlumnos" :key="alumno.id">
                      <CTableDataCell class="fw-semibold text-center d-none d-md-table-cell">
                        {{ (page - 1) * pageSize + index + 1 }}
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
                        <div class="fw-semibold">
                          {{ alumno.surname_father }} {{ alumno.surname_mother }}
                        </div>
                        <div class="small text-body-secondary">{{ alumno.nombre }}</div>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado(alumno.estado)">
                          {{ textoEstado(alumno.estado) }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center fw-medium">
                        {{ esFaltaSinHora(alumno.estado) ? '—' : formatTime(alumno.hora) }}
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>

              <TablePagination
                v-model="page"
                :total="alumnos.length"
                :page-size="pageSize"
                aria-label="Paginación de alumnos del aula"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import { formatTime, fecha_actual } from '@/utils/time'
import { textoEstado, colorEstado, gradoTexto, esFaltaSinHora } from '@/utils/utils'
import TablePagination from '@/components/academic/TablePagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'

const route = useRoute()
const router = useRouter()
const seccionId = route.params.id
const grado = ref(null)
const seccion = ref(null)
const alumnos = ref([])

const { page, pageSize, pagedItems: pagedAlumnos } = useClientPagination(alumnos, 15)

const goBack = () => {
  router.push('/assistances/seguimiento')
}

AssistanceService.getDetailAssistanceBySeccion(seccionId).then((response) => {
  alumnos.value = response.data.alumnos || []
  grado.value = response.data.grade
  seccion.value = response.data.section
  page.value = 1
})
</script>

<style scoped>
.aula-header {
  padding-bottom: 0.15rem;
}

.aula-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--cui-border-color, #d8dbe0);
}

.aula-header__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--cui-primary, #321fdb);
}

.aula-header__back {
  flex-shrink: 0;
}

.aula-header__meta {
  padding-right: 0.25rem;
}

@media (max-width: 767.98px) {
  .aula-header__title {
    font-size: 1.25rem;
  }

  .aula-header__back {
    padding-inline: 0.7rem;
  }
}

@media (min-width: 768px) {
  .aula-header__title {
    font-size: 1.5rem;
  }
}
</style>

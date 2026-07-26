<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <CRow class="gy-3 align-items-end">
              <CCol xs="12" md="5">
                <h4 class="fw-bold text-primary mb-0 d-flex align-items-center">
                  <i class="fas fa-chart-line me-2"></i>
                  Seguimiento diario por aula
                </h4>
              </CCol>

              <CCol xs="12" md="4">
                <label class="form-label fw-semibold mb-1">Aula</label>
                <CFormSelect v-model="aulaId" class="w-100">
                  <option value="">Todas</option>
                  <option
                    v-for="aula in aulasOptions"
                    :key="aula.grade_section_id"
                    :value="String(aula.grade_section_id)"
                  >
                    {{ aula.grado }}° {{ aula.seccion }}
                  </option>
                </CFormSelect>
              </CCol>

              <CCol xs="12" md="3">
                <div class="d-flex justify-content-md-end">
                  <CBadge color="dark" class="px-3 py-2 fs-6 w-100 w-md-auto text-center">
                    📅 {{ fechaHora }}
                  </CBadge>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Cards resumen -->
    <CRow class="mb-1">
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-primary shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Alumnos</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_registros }} <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total_registros) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-success shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_asistencias }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_asistencias)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TL')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Leves</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_leve }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_leve)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
            <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TM')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanza Moderado</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_moderado }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_moderado)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
            <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TG')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Grave</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_grave }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_grave)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
            <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('TE')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Tardanzas Extremo</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_tard_extremo }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_tard_extremo)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard :class="colorEstado('F')">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.t_faltas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.t_faltas)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla secciones -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell assist-table-tight">
              <CTable hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-start">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-md-table-cell">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-none d-lg-table-cell">Tard. Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-center d-lg-none">Tard.</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Faltas</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Ver</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  <template v-if="!secciones.length">
                    <CTableRow>
                      <CTableDataCell colspan="10" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in secciones" :key="item.grade_section_id">
                      <CTableDataCell class="fw-semibold text-start">
                        {{ item.grado }}° {{ item.seccion }}
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-none d-md-table-cell">
                        <CBadge color="primary" class="assist-badge-sm">{{ item.total }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('A')" class="assist-badge-sm">{{ item.t_asistencias }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TL')" class="assist-badge-sm">{{ item.t_tard_leve }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TM')" class="assist-badge-sm">{{ item.t_tard_moderado }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TG')" class="assist-badge-sm">{{ item.t_tard_grave }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TE')" class="assist-badge-sm">{{ item.t_tard_extremo }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-lg-none">
                        <CBadge :class="colorEstado('TM')" class="assist-badge-sm">{{ totalTardanzas(item) }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('F')" class="assist-badge-sm">{{ item.t_faltas }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <i
                          class="fas fa-eye text-primary"
                          style="cursor: pointer; font-size: 16px"
                          @click="verDetalle(item)"
                        ></i>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { useRouter } from 'vue-router'
import { CCard, CTableDataCell } from '@coreui/vue'
import { useFechaHora } from '@/composables/useFechaHora'
import { colorEstado } from '@/utils/utils'

const emptyResumen = () => ({
  total_registros: 0,
  t_asistencias: 0,
  t_tard_leve: 0,
  t_tard_moderado: 0,
  t_tard_grave: 0,
  t_tard_extremo: 0,
  t_faltas: 0,
})

const resumenFromAula = (item) => ({
  total_registros: Number(item.total || 0),
  t_asistencias: Number(item.t_asistencias || 0),
  t_tard_leve: Number(item.t_tard_leve || 0),
  t_tard_moderado: Number(item.t_tard_moderado || 0),
  t_tard_grave: Number(item.t_tard_grave || 0),
  t_tard_extremo: Number(item.t_tard_extremo || 0),
  t_faltas: Number(item.t_faltas || 0),
})

const { fechaHora } = useFechaHora()
const router = useRouter()
const aulaId = ref('')
const seccionesAll = ref([])
const dataAll = ref(emptyResumen())
let refreshTimer = null

const aulasOptions = computed(() => seccionesAll.value)

const secciones = computed(() => {
  if (!aulaId.value) return seccionesAll.value
  return seccionesAll.value.filter(
    (item) => String(item.grade_section_id) === String(aulaId.value),
  )
})

const data = computed(() => {
  if (!aulaId.value) return dataAll.value
  const item = seccionesAll.value.find(
    (aula) => String(aula.grade_section_id) === String(aulaId.value),
  )
  return item ? resumenFromAula(item) : emptyResumen()
})

const totalTardanzas = (item) =>
  Number(item.t_tard_leve || 0) +
  Number(item.t_tard_moderado || 0) +
  Number(item.t_tard_grave || 0) +
  Number(item.t_tard_extremo || 0)

const verDetalle = (item) => {
  router.push(`/assistances/seguimiento/seccion/${item.grade_section_id}`)
}

const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
}

const loadAsistencesBySeccion = async () => {
  const params = { tipo: 'diario' }
  AssistanceService.getAsistenciaBySeccion(params).then((res) => {
    seccionesAll.value = res.data.data || []
    dataAll.value = {
      total_registros: res.data.total_registros || 0,
      t_asistencias: res.data.t_asistencias || 0,
      t_tard_leve: res.data.t_tard_leve || 0,
      t_tard_moderado: res.data.t_tard_moderado || 0,
      t_tard_grave: res.data.t_tard_grave || 0,
      t_tard_extremo: res.data.t_tard_extremo || 0,
      t_faltas: res.data.t_faltas || 0,
    }

    // Si el aula seleccionada ya no está en la lista, volver a "Todas"
    if (
      aulaId.value &&
      !seccionesAll.value.some((aula) => String(aula.grade_section_id) === String(aulaId.value))
    ) {
      aulaId.value = ''
    }
  })
}

onMounted(() => {
  loadAsistencesBySeccion()
  refreshTimer = setInterval(loadAsistencesBySeccion, 15000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
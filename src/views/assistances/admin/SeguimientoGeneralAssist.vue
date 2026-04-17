<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-3 px-4">

            <!-- Título -->
            <div class="mb-2 mb-md-0">
              <h4 class="fw-bold text-primary mb-0 d-flex align-items-center">
                <i class="fas fa-chart-line me-2"></i>
                Seguimiento diario por aula
              </h4>
            </div>

            <!-- Fecha -->
            <div class="d-flex align-items-center">
              <CBadge color="dark" class="px-3 py-2 fs-6 w-100 w-md-auto text-center">
                📅 {{ fechaHora }}
              </CBadge>
            </div>

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
            <div class="modern-table-shell">
              <CTable hover responsive align="middle" class="mb-0 text-center">
                <CTableHead class="modern-table-header text-center">
                  <CTableRow>
                    <CTableHeaderCell class="text-center">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-center wrap-text">Tardanza Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-center ">Faltas</CTableHeaderCell>
                    <CTableHeaderCell class="text-center ">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <!-- CUERPO -->
                <CTableBody>
                  <template v-if="!secciones.length">
                    <CTableRow>
                      <CTableDataCell colspan="6" class="list-empty-message py-4">
                        No hay registros para mostrar.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in secciones" :key="item.id">

                      <CTableDataCell class="fw-semibold text-center">
                        {{ item.grado }}° {{ item.seccion }}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="primary" class="px-3 py-1 fs-6">
                          {{ item.total }}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge :class="colorEstado('A')">
                          {{ item.t_asistencias }}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge :class="colorEstado('TL')">
                          {{ item.t_tard_leve }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TM')">
                          {{ item.t_tard_moderado }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TG')">
                          {{ item.t_tard_grave }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('TE')">
                          {{ item.t_tard_extremo }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge :class="colorEstado('F')">
                          {{ item.t_faltas }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <i class="fas fa-eye text-primary" style="cursor:pointer; font-size:16px"
                          @click="verDetalle(item)"></i>
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
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { useRouter } from 'vue-router'
import { CCard, CTableDataCell } from '@coreui/vue'
import { useFechaHora } from '@/composables/useFechaHora'
import { colorEstado } from '@/utils/utils'

const { fechaHora } = useFechaHora()
const secciones = ref([])
const router = useRouter()
const data = ref({
  total_registros: 0,
  t_asistencias: 0,
  t_tard_leve: 0,
  t_tard_moderado: 0,
  t_tard_grave: 0,
  t_tard_extremo: 0,
  t_faltas: 0
})



const verDetalle = (item) => {
  router.push(`/assistances/seguimiento/seccion/${item.grade_section_id}`)
}

const porcentaje = (valor) => {
  if (!data.value.total_registros) return 0
  return ((valor / data.value.total_registros) * 100).toFixed(1)
}


const loadAsistencesBySeccion = async () => {
  let params = {
    tipo: 'diario'
  }

  AssistanceService.getAsistenciaBySeccion(params).then(res => {
    secciones.value = res.data.data
    data.value = res.data
  })

}

onMounted(() => {
  loadAsistencesBySeccion()
  setInterval(loadAsistencesBySeccion, 15000)
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

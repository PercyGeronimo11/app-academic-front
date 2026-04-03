<template>
  <CContainer fluid>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-2 px-4">

            <!-- Título -->
            <div class="mb-2 mb-md-0">
              <h4 class="fw-bold text-primary mb-0 d-flex align-items-center">
                <i class="fas fa-chart-line me-2"></i>
                Seguimiento diario
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
            <div class="fs-6 fw-semibold">Total Registros</div>
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
            <div class="fs-6 fw-semibold">Total Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_presentes }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_presentes)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-warning shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Tardanzas</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_tardanzas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_tardanzas)
              }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3" class="mb-3">
        <CCard class="text-white bg-danger shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.total_faltas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.total_faltas)
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
          <CCardHeader class="bg-white border-bottom py-2">
            <div class="d-flex justify-content-between align-items-center">

              <h5 class="fw-bold text-primary mb-0">
                <i class="fas fa-chart-bar me-1"></i>
                Seguimiento por aula
              </h5>

              <div class="d-flex align-items-center">
                <span class="me-2 text-success fw-semibold ">
                  En seguimiento <i class="fas fa-eye me-2"></i>
                </span>
              </div>
            </div>
          </CCardHeader>

          <!-- BODY -->
          <CCardBody class="p-0">
            <div class="modern-table-shell">
            <CTable hover responsive align="middle" class="mb-0 text-center">
              <CTableHead class="modern-table-header text-center">
                <CTableRow>
                  <CTableHeaderCell class="text-center">Sección</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Total</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Asistencias</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Tardanzas</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Faltas</CTableHeaderCell>
                  <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
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
                      <CBadge color="success" class="px-3 py-1 fs-6">
                        {{ item.asistencias }}
                      </CBadge>
                    </CTableDataCell>

                    <CTableDataCell>
                      <CBadge color="warning" class="px-3 py-1 fs-6">
                        {{ item.tardanzas }}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="danger" class="px-3 py-1 fs-6">
                        {{ item.faltas }}
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
import { CCard } from '@coreui/vue'
import { useFechaHora } from '@/composables/useFechaHora'

const { fechaHora } = useFechaHora()
const secciones = ref([])
const router = useRouter()
const data = ref({
  total_registros: 0,
  total_presentes: 0,
  total_tardanzas: 0,
  total_faltas: 0
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
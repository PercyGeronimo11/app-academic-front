<template>
  <CContainer fluid>

    <CRow class="mb-4">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="d-flex justify-content-between align-items-center py-3 px-4">

            <div>
              <h3 class="fw-bold text-primary mb-1">
                Seguimiento de asistencias del día
              </h3>

              <div class="d-flex align-items-center gap-2 small">

                <CBadge color="primary" class="px-3 py-2 fs-6">
                  {{ fecha_actual }}
                </CBadge>
              </div>
            </div>

            <!-- Indicador visual -->
            <div class="d-flex align-items-center">
              <span class="me-2 text-success fw-semibold ">
                En seguimiento
              </span>
              <span style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;"></span>
            </div>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Cards resumen -->
    <CRow>

      <!-- Total -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-primary shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Alumnos</div>
            <div class="fs-4 fw-semibold">
              {{ data.total }} <span class="fs-6 fw-normal opacity-75">
                ({{ porcentaje(data.total) }}%)
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Asistencias -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-success shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Asistencias</div>
            <div class="fs-4 fw-semibold">
              {{ data.presentes }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.presentes) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Tardanzas -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-warning shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Tardanzas</div>
            <div class="fs-4 fw-semibold">
              {{ data.tardanzas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.tardanzas) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Faltas -->
      <CCol sm="6" lg="3">
        <CCard class="text-white bg-danger shadow">
          <CCardBody>
            <div class="fs-6 fw-semibold">Total Faltas</div>
            <div class="fs-4 fw-semibold">
              {{ data.faltas }} <span class="fs-6 fw-normal opacity-75">({{ porcentaje(data.faltas) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>


    <!-- Tabla secciones -->
    <CRow class="mt-5">
      <CCol>

        <CCard class="shadow-sm border-0">

          <!-- HEADER -->
          <CCardHeader class="bg-white border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center">

              <h5 class="fw-bold text-primary mb-0">
                <i class="fas fa-chart-bar me-2"></i>
                Seguimiento de asistencias por sección
              </h5>

              <div class="d-flex align-items-center">
                <span class="me-2 text-success fw-semibold ">
                  Actualización automática
                </span>
                <span style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;"></span>
              </div>

            </div>
          </CCardHeader>

          <!-- BODY -->
          <CCardBody class="p-0">

            <CTable hover responsive striped align="middle" class="mb-0 text-center">

              <!-- CABECERA -->
              <CTableHead class="table-light text-center">
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

                <CTableRow v-for="item in secciones" :key="item.id">

                  <CTableDataCell class="fw-semibold text-center">
                    {{ item.grado }}° {{ item.seccion }}
                  </CTableDataCell>

                  <!-- TOTAL -->
                  <CTableDataCell>
                    <CBadge color="primary" class="px-3 py-2 fs-6">
                      {{ item.total }}
                    </CBadge>
                  </CTableDataCell>

                  <!-- ASISTENCIAS -->
                  <CTableDataCell>
                    <CBadge color="success" class="px-3 py-2 fs-6">
                      {{ item.asistencias }}
                    </CBadge>
                  </CTableDataCell>

                  <!-- TARDANZAS -->
                  <CTableDataCell>
                    <CBadge color="warning" class="px-3 py-2 fs-6">
                      {{ item.tardanzas }}
                    </CBadge>
                  </CTableDataCell>

                  <!-- FALTAS -->
                  <CTableDataCell>
                    <CBadge color="danger" class="px-3 py-2 fs-6">
                      {{ item.faltas }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <i class="fas fa-eye text-primary" style="cursor:pointer; font-size:16px"
                      @click="verDetalle(item)"></i>
                  </CTableDataCell>


                </CTableRow>

              </CTableBody>

            </CTable>

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

const router = useRouter()
const data = ref({
  total: 0,
  presentes: 0,
  tardanzas: 0,
  faltas: 0
})

const fecha_actual = new Date().toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})


const verDetalle = (item) => {
  router.push(`/assistances/seccion/${item.grade_section_id}`)
}

const obtenerResumen = async () => {
  const res = await AssistanceService.getResumenDiario()
  data.value = res.data
}

const porcentaje = (valor) => {
  if (!data.value.total) return 0
  return ((valor / data.value.total) * 100).toFixed(1)
}


// ----------------------------------------
const secciones = ref([])

const generarDatosSimulados = () => {
  AssistanceService.getAsistenciaBySeccion().then(res => {
    secciones.value = res.data
  })
}


onMounted(() => {
  generarDatosSimulados()
  obtenerResumen()
  setInterval(obtenerResumen, 5000)
  setInterval(generarDatosSimulados, 5000)
})

</script>
<style scoped></style>
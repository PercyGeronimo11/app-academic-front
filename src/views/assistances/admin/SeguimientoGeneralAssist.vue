<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <h5 class="fw-bold text-primary mb-0 d-flex align-items-center">
              <i class="fas fa-chart-line me-2"></i>
              Seguimiento diario por aulas
            </h5>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Cards resumen: 2 por fila en móvil -->
    <CRow class="mb-1 g-2">
      <CCol xs="6" lg="3">
        <CCard class="text-white bg-primary shadow h-100 summary-card">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Total Alumnos</div>
            <div class="summary-card__value">
              {{ data.total_registros }}
              <span class="summary-card__pct">({{ porcentaje(data.total_registros) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard class="text-white bg-success shadow h-100 summary-card">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Asistencias</div>
            <div class="summary-card__value">
              {{ data.t_asistencias }}
              <span class="summary-card__pct">({{ porcentaje(data.t_asistencias) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TL'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Leves</div>
            <div class="summary-card__value">
              {{ data.t_tard_leve }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_leve) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TM'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanza Moderado</div>
            <div class="summary-card__value">
              {{ data.t_tard_moderado }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_moderado) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TG'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Grave</div>
            <div class="summary-card__value">
              {{ data.t_tard_grave }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_grave) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('TE'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Tardanzas Extremo</div>
            <div class="summary-card__value">
              {{ data.t_tard_extremo }}
              <span class="summary-card__pct">({{ porcentaje(data.t_tard_extremo) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs="6" lg="3">
        <CCard :class="[colorEstado('FI'), 'shadow h-100 summary-card']">
          <CCardBody class="summary-card__body">
            <div class="summary-card__label">Total Faltas</div>
            <div class="summary-card__value">
              {{ data.t_faltas }}
              <span class="summary-card__pct">({{ porcentaje(data.t_faltas) }}%)</span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tabla secciones -->
    <CRow class="mb-3 mt-2">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell">
              <CTable hover responsive align="middle" class="mb-0">
                <CTableHead color="info" class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell class="text-white text-start">Aula</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-md-table-cell">Total</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Puntual</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Leve</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Moderada</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Grave</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-none d-lg-table-cell">Tard. Extrema</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center d-lg-none">Tard.</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Faltas</CTableHeaderCell>
                    <CTableHeaderCell class="text-white text-center">Ver</CTableHeaderCell>
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
                        <CBadge color="primary">{{ item.total }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('A')">{{ item.t_asistencias }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TL')">{{ item.t_tard_leve }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TM')">{{ item.t_tard_moderado }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TG')">{{ item.t_tard_grave }}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center d-none d-lg-table-cell">
                        <CBadge :class="colorEstado('TE')">{{ item.t_tard_extremo }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center d-lg-none">
                        <CBadge :class="colorEstado('TM')">{{ totalTardanzas(item) }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado('FI')">{{ item.t_faltas }}</CBadge>
                      </CTableDataCell>

                      <CTableDataCell class="text-center">
                        <CButton
                          size="sm"
                          color="info"
                          variant="outline"
                          title="Ver detalle"
                          @click="verDetalle(item)"
                        >
                          <i class="fas fa-eye"></i>
                        </CButton>
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
import { ref, onMounted, onUnmounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const secciones = ref([])
const data = ref(emptyResumen())
let refreshTimer = null

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
    secciones.value = res.data.data || []
    data.value = {
      total_registros: res.data.total_registros || 0,
      t_asistencias: res.data.t_asistencias || 0,
      t_tard_leve: res.data.t_tard_leve || 0,
      t_tard_moderado: res.data.t_tard_moderado || 0,
      t_tard_grave: res.data.t_tard_grave || 0,
      t_tard_extremo: res.data.t_tard_extremo || 0,
      t_faltas: res.data.t_faltas || 0,
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

<style scoped>
.summary-card__body {
  padding: 0.75rem 0.85rem;
}

.summary-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.summary-card__value {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.summary-card__pct {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.85;
}

@media (min-width: 992px) {
  .summary-card__body {
    padding: 1rem 1.15rem;
  }

  .summary-card__label {
    font-size: 0.95rem;
  }

  .summary-card__value {
    font-size: 1.4rem;
  }

  .summary-card__pct {
    font-size: 0.9rem;
  }
}
</style>

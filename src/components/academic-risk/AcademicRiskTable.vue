<template>
  <CRow class="mb-4">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader
          class="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
        >
          <h5 class="fw-bold text-primary mb-0">
            <i class="fas fa-table me-2 text-primary"></i>
            Resultados de predicción
          </h5>
          <CBadge
            v-if="!loading && !error && !connectionError"
            color="primary"
            shape="rounded-pill"
            class="academic-risk-table__count"
          >
            {{ rows.length }} {{ rows.length === 1 ? 'alumno' : 'alumnos' }}
          </CBadge>
        </CCardHeader>

        <CCardBody class="p-0">
          <div v-if="loading" class="text-center py-5">
            <CSpinner color="primary" />
            <p class="mt-3 mb-0 text-body-secondary">Cargando predicciones...</p>
          </div>

          <div v-else-if="connectionError" class="table-empty-unified py-5">
            <span class="table-empty-unified__icon">⚠️</span>
            <p class="table-empty-unified__title">Error de conexión</p>
            <p class="table-empty-unified__hint">No se pudo comunicar con el servidor. Verifique su conexión.</p>
          </div>

          <div v-else-if="error" class="table-empty-unified py-5">
            <span class="table-empty-unified__icon">⚠️</span>
            <p class="table-empty-unified__title">Error del servidor</p>
            <p class="table-empty-unified__hint">{{ error }}</p>
          </div>

          <div v-else class="modern-table-shell">
            <CTable hover responsive align="middle" class="mb-0 text-center">
              <CTableHead class="modern-table-header text-center">
                <CTableRow>
                  <CTableHeaderCell>Código</CTableHeaderCell>
                  <CTableHeaderCell>Alumno</CTableHeaderCell>
                  <CTableHeaderCell>Aula</CTableHeaderCell>
                  <CTableHeaderCell>Nivel de Riesgo</CTableHeaderCell>
                  <CTableHeaderCell>Confianza</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Última actualización</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-if="!rows.length">
                  <CTableDataCell colspan="8" class="list-empty-message py-4">
                    No hay registros para mostrar con los filtros seleccionados.
                  </CTableDataCell>
                </CTableRow>

                <CTableRow v-for="row in rows" :key="row.studentId">
                  <CTableDataCell>{{ row.studentCode }}</CTableDataCell>
                  <CTableDataCell class="fw-semibold text-start">{{ row.fullName }}</CTableDataCell>
                  <CTableDataCell>{{ row.classroomLabel }}</CTableDataCell>
                  <CTableDataCell>
                    <span v-if="row.riskLevel" :class="getRiskChipClass(row.riskLevel)">
                      {{ getRiskLabel(row.riskLevel) }}
                    </span>
                    <span v-else class="text-body-secondary">—</span>
                  </CTableDataCell>
                  <CTableDataCell>{{ formatConfidence(row.confidence) }}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge :color="getStatusBadge(row.status).color">
                      {{ getStatusBadge(row.status).label }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{{ formatDateTime(row.lastUpdated) }}</CTableDataCell>
                  <CTableDataCell>
                    <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                      <CButton
                        v-if="canPredict"
                        color="info"
                        variant="outline"
                        size="sm"
                        class="academic-risk-predict-btn"
                        :disabled="predictDisabled || predictingStudentId === row.studentId"
                        :title="'Calcular predicción individual'"
                        @click="$emit('predict-student', row)"
                      >
                        <CSpinner
                          v-if="predictingStudentId === row.studentId"
                          component="span"
                          size="sm"
                          aria-hidden="true"
                        />
                        <i v-else class="fas fa-brain"></i>
                      </CButton>
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        title="Ir a perfil"
                        @click="$emit('go-to-profile', row)"
                      >
                        Ir a perfil
                      </CButton>
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        :disabled="!row.prediction"
                        @click="$emit('view-detail', row)"
                      >
                        Ver detalle
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import {
  formatConfidence,
  formatDateTime,
  getRiskChipClass,
  getRiskLabel,
  getStatusBadge,
} from '@/utils/academicRisk'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  connectionError: {
    type: Boolean,
    default: false,
  },
  canPredict: {
    type: Boolean,
    default: false,
  },
  predictingStudentId: {
    type: [Number, String],
    default: null,
  },
  predictDisabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view-detail', 'predict-student', 'go-to-profile'])
</script>

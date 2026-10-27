<template>
  <CRow class="mb-4">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader
          class="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
        >
          <h5 class="fw-bold mb-0">
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
            <p class="table-empty-unified__hint">
              No se pudo comunicar con el servidor. Verifique su conexión.
            </p>
          </div>

          <div v-else-if="error" class="table-empty-unified py-5">
            <span class="table-empty-unified__icon">⚠️</span>
            <p class="table-empty-unified__title">Error del servidor</p>
            <p class="table-empty-unified__hint">{{ error }}</p>
          </div>

          <div v-else class="modern-table-shell academic-risk-table-shell">
            <CTable hover responsive align="middle" class="mb-0 academic-risk-results-table">
              <CTableHead class="modern-table-header">
                <CTableRow>
                  <CTableHeaderCell class="text-start">Alumno</CTableHeaderCell>
                  <CTableHeaderCell class="academic-risk-col-aula">Aula</CTableHeaderCell>
                  <CTableHeaderCell>B1 nivel</CTableHeaderCell>
                  <CTableHeaderCell>B1 conf.</CTableHeaderCell>
                  <CTableHeaderCell>B2 nivel</CTableHeaderCell>
                  <CTableHeaderCell>B2 conf.</CTableHeaderCell>
                  <CTableHeaderCell>B3 nivel</CTableHeaderCell>
                  <CTableHeaderCell>B3 conf.</CTableHeaderCell>
                  <CTableHeaderCell class="academic-risk-col-obs">Observación</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                <CTableRow v-if="!rows.length">
                  <CTableDataCell colspan="10" class="list-empty-message py-4 text-center">
                    No hay registros para mostrar con los filtros seleccionados.
                  </CTableDataCell>
                </CTableRow>

                <CTableRow v-for="row in rows" :key="row.studentId">
                  <CTableDataCell class="text-start academic-risk-student-cell">
                    <div class="fw-semibold">{{ row.fullName }}</div>
                    <div class="academic-risk-student-cell__aula text-body-secondary small d-md-none">
                      {{ row.classroomLabel || 'Sin aula' }}
                    </div>
                  </CTableDataCell>
                  <CTableDataCell class="academic-risk-col-aula text-center">
                    {{ row.classroomLabel }}
                  </CTableDataCell>

                  <template v-for="n in [1, 2, 3]" :key="`${row.studentId}-b${n}`">
                    <CTableDataCell class="text-center">
                      <span
                        v-if="row.byBimester?.[n]?.riskLevel"
                        :class="getRiskChipClass(row.byBimester[n].riskLevel)"
                      >
                        {{ getRiskLabel(row.byBimester[n].riskLevel) }}
                      </span>
                      <span v-else class="text-body-secondary">—</span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center small">
                      {{ formatConfidence(row.byBimester?.[n]?.confidence) }}
                    </CTableDataCell>
                  </template>

                  <CTableDataCell class="academic-risk-col-obs small text-start">
                    {{ row.observation || '—' }}
                  </CTableDataCell>

                  <CTableDataCell>
                    <div class="academic-risk-actions">
                      <CButton
                        v-if="canPredict"
                        color="info"
                        variant="outline"
                        size="sm"
                        class="academic-risk-predict-btn"
                        :disabled="predictDisabled || predictingStudentId === row.studentId"
                        title="Calcular predicción individual (bimestres cerrados)"
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
                        <span class="academic-risk-action-label">Perfil</span>
                        <i class="fas fa-user academic-risk-action-icon"></i>
                      </CButton>
                      <CButton
                        color="primary"
                        class="academic-risk-detail-btn"
                        size="sm"
                        :disabled="!hasAnyPrediction(row)"
                        title="Ver detalle"
                        @click="$emit('view-detail', row)"
                      >
                        <i class="fas fa-eye me-1"></i>
                        <span class="academic-risk-action-label">Detalle</span>
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
  getRiskChipClass,
  getRiskLabel,
} from '@/utils/academicRisk'

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  connectionError: { type: Boolean, default: false },
  canPredict: { type: Boolean, default: false },
  predictingStudentId: { type: [Number, String], default: null },
  predictDisabled: { type: Boolean, default: false },
})

defineEmits(['view-detail', 'predict-student', 'go-to-profile'])

const hasAnyPrediction = (row) => (
  [1, 2, 3].some((n) => Boolean(row.byBimester?.[n]?.prediction))
)
</script>

<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-ops-card">
    <CCardBody class="p-3 p-md-4">
      <!-- Cabecera ML -->
      <div class="academic-risk-ops-card__header">
        <div class="academic-risk-ops-card__intro">
          <div class="academic-risk-ops-card__icon" aria-hidden="true">
            <i class="fas fa-brain"></i>
          </div>
          <div class="academic-risk-ops-card__titles">
            <h4 class="academic-risk-ops-card__title mb-2">Predicción del nivel de riesgo académico</h4>
            <p class="academic-risk-ops-card__desc mb-0">
              Predicción de riesgo académico por alumno de los 3 bimestres.
            </p>
          </div>
        </div>

        <div class="academic-risk-ops-card__aside">
          <div class="academic-risk-ops-card__context">
            <div
              v-if="store.activeSchoolYear"
              class="academic-risk-ops-chip"
              title="Periodo activo en Configuraciones"
            >
              <i class="fas fa-calendar-check" aria-hidden="true"></i>
              <div>
                <span class="academic-risk-ops-chip__label">Año escolar</span>
                <strong>{{ store.activeSchoolYear }}</strong>
                <small>activo</small>
              </div>
            </div>
            <div
              v-if="store.currentBimester"
              class="academic-risk-ops-chip"
              title="Solo se predicen bimestres ya cerrados"
            >
              <i class="fas fa-layer-group" aria-hidden="true"></i>
              <div>
                <span class="academic-risk-ops-chip__label">Bimestre vigente</span>
                <strong>B{{ store.currentBimester }}</strong>
                <small v-if="store.predictableBimesters.length">
                  predice {{ store.predictableBimesters.map((n) => `B${n}`).join(', ') }}
                </small>
                <small v-else>sin cerrados</small>
              </div>
            </div>
          </div>

          <CButton
            color="secondary"
            variant="outline"
            class="academic-risk-ops-card__dash-btn"
            @click="$emit('go-dashboard')"
          >
            <i class="fas fa-chart-line me-2"></i>
            Dashboard
          </CButton>
        </div>
      </div>

      <hr class="academic-risk-ops-card__divider" />

      <!-- Controles de aula -->
      <div class="academic-risk-filters__row">
        <div v-if="!store.scope.isStudentView" class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-graduation-cap me-1" aria-hidden="true"></i>
            Grado
          </CFormLabel>
          <CFormSelect
            :model-value="store.filters.grade"
            :disabled="store.loading || store.updating || !store.gradeOptions.length"
            @change="handleGradeChange"
          >
            <option v-for="g in store.gradeOptions" :key="g" :value="g">{{ g }}°</option>
          </CFormSelect>
        </div>

        <div v-if="!store.scope.isStudentView" class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-door-open me-1" aria-hidden="true"></i>
            Sección
          </CFormLabel>
          <CFormSelect
            :model-value="store.filters.section"
            :disabled="store.loading || store.updating || !store.sectionOptions.length"
            @change="handleSectionChange"
          >
            <option v-for="s in store.sectionOptions" :key="s" :value="s">{{ s }}</option>
          </CFormSelect>
        </div>

        <div
          v-if="store.scope.isStudentView"
          class="academic-risk-filters__field academic-risk-filters__field--info"
        >
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-user-graduate me-1" aria-hidden="true"></i>
            Consulta personal
          </CFormLabel>
          <p class="text-body-secondary mb-0 small">
            Visualizando únicamente su predicción de riesgo académico.
          </p>
        </div>

        <div v-if="store.canUpdate" class="academic-risk-filters__actions">
          <CButton
            color="primary"
            class="academic-risk-ops-card__update-btn"
            :disabled="!store.canUpdate"
            @click="$emit('update-predictions')"
          >
            <i class="fas fa-sync-alt me-2"></i>
            Generar predicciones
          </CButton>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { useAcademicRiskStore } from '@/stores/academicRisk'

defineEmits(['update-predictions', 'go-dashboard'])

const store = useAcademicRiskStore()

const handleGradeChange = (event) => {
  store.onGradeChange(event.target.value)
}

const handleSectionChange = (event) => {
  store.onSectionChange(event.target.value)
}
</script>


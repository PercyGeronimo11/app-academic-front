<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-filters">
    <CCardBody class="p-3 p-md-4">
      <div class="academic-risk-filters__row">
        <div
          v-if="store.activeSchoolYear"
          class="academic-risk-filters__field academic-risk-filters__field--year"
        >
          <CFormLabel class="academic-risk-filters__label">Año escolar</CFormLabel>
          <div class="academic-risk-filters__year-badge" title="Periodo activo en Configuraciones">
            <i class="fas fa-calendar-alt" aria-hidden="true"></i>
            <span>{{ store.activeSchoolYear }}</span>
            <small>activo</small>
          </div>
        </div>

        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Bimestre</CFormLabel>
          <CFormSelect
            :model-value="store.filters.bimester"
            :disabled="store.loading || store.updating || !store.bimesters.length"
            @change="handleBimesterChange"
          >
            <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div v-if="!store.scope.isStudentView" class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Aula</CFormLabel>
          <CFormSelect
            :model-value="store.filters.gradeSectionId"
            :disabled="store.loading || store.updating || !store.gradeSections.length"
            @change="handleGradeSectionChange"
          >
            <option v-for="item in store.gradeSections" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </CFormSelect>
        </div>

        <div
          v-if="store.scope.isStudentView"
          class="academic-risk-filters__field academic-risk-filters__field--info"
        >
          <CFormLabel class="academic-risk-filters__label">Consulta personal</CFormLabel>
          <p class="text-body-secondary mb-0 small">
            Visualizando únicamente su predicción de riesgo académico.
          </p>
        </div>

        <div v-if="store.canUpdate" class="academic-risk-filters__actions">
          <CButton
            color="primary"
            :disabled="!store.canUpdate"
            @click="$emit('update-predictions')"
          >
            <i class="fas fa-sync-alt me-2"></i>
            Actualizar Predicciones
          </CButton>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { useAcademicRiskStore } from '@/stores/academicRisk'

defineEmits(['update-predictions'])

const store = useAcademicRiskStore()

const handleBimesterChange = (event) => {
  store.onBimesterChange(Number(event.target.value))
}

const handleGradeSectionChange = (event) => {
  store.onGradeSectionChange(Number(event.target.value))
}
</script>

<style scoped>
.academic-risk-filters__field--year {
  flex: 0 1 auto;
  min-width: 8.5rem;
}

.academic-risk-filters__year-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 38px;
  padding: 0.35rem 0.75rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-brand-soft);
  border: 1px solid var(--rp-border-brand);
  color: var(--rp-text-brand);
  font-size: 0.9rem;
  font-weight: var(--rp-weight-semibold);
  white-space: nowrap;
}

.academic-risk-filters__year-badge i {
  color: var(--rp-brand-500);
}

.academic-risk-filters__year-badge small {
  font-size: 0.65rem;
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-muted);
}
</style>

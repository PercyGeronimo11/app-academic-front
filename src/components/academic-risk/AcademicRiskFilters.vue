<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-filters">
    <CCardBody class="p-3 p-md-4">
      <div class="academic-risk-filters__row">
        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Año escolar</CFormLabel>
          <CFormSelect
            :model-value="store.filters.schoolYear"
            :disabled="store.loading || store.updating"
            @change="handleSchoolYearChange"
          >
            <option v-for="year in store.schoolYears" :key="year" :value="year">
              {{ year }}
            </option>
          </CFormSelect>
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

const handleSchoolYearChange = (event) => {
  store.onSchoolYearChange(Number(event.target.value))
}

const handleBimesterChange = (event) => {
  store.onBimesterChange(Number(event.target.value))
}

const handleGradeSectionChange = (event) => {
  store.onGradeSectionChange(Number(event.target.value))
}
</script>

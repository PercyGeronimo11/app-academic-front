<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-filters risk-dash-filters">
    <CCardBody class="p-3 p-md-4">
      <div class="academic-risk-filters__row">
        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Año escolar</CFormLabel>
          <CFormSelect
            :model-value="store.filters.schoolYear"
            :disabled="store.loading || store.updating"
            @change="onYear"
          >
            <option v-for="year in store.schoolYears" :key="year" :value="year">{{ year }}</option>
          </CFormSelect>
        </div>

        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Bimestre</CFormLabel>
          <CFormSelect
            :model-value="store.filters.bimester"
            :disabled="store.loading || store.updating || !store.bimesters.length"
            @change="onBimester"
          >
            <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div class="academic-risk-filters__actions">
          <CButton
            color="secondary"
            variant="outline"
            :disabled="store.loading || store.updating || !store.canQuery"
            @click="$emit('apply')"
          >
            <i class="fas fa-search me-2"></i>
            Consultar
          </CButton>
          <CButton
            v-if="showBulkUpdate && store.canUpdatePredictions"
            color="primary"
            :disabled="!store.canUpdatePredictions || store.updating"
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
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'

defineProps({
  showBulkUpdate: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['apply', 'update-predictions'])

const store = useAcademicRiskDashboardStore()

const onYear = async (event) => {
  await store.onSchoolYearChange(Number(event.target.value))
}

const onBimester = (event) => {
  store.onBimesterChange(Number(event.target.value))
}
</script>

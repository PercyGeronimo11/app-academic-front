<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-ops-card">
    <CCardBody class="p-3 p-md-4">
      <div class="academic-risk-ops-card__header">
        <div class="academic-risk-ops-card__intro">
          <div class="academic-risk-ops-card__icon" aria-hidden="true">
            <i :class="iconClass"></i>
          </div>
          <div class="academic-risk-ops-card__titles">
            <p class="academic-risk-ops-card__eyebrow mb-1">
              <i class="fas fa-shield-alt me-1"></i>
              {{ eyebrow }}
            </p>
            <h4 class="academic-risk-ops-card__title mb-2">{{ title }}</h4>
            <p class="academic-risk-ops-card__desc mb-0">{{ description }}</p>
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
                <span class="academic-risk-ops-chip__label">Periodo actual</span>
                <strong>{{ store.activeSchoolYear }}</strong>
                <small>activo</small>
              </div>
            </div>
            <div
              v-if="store.currentBimester"
              class="academic-risk-ops-chip"
              title="Bimestre vigente según fechas"
            >
              <i class="fas fa-layer-group" aria-hidden="true"></i>
              <div>
                <span class="academic-risk-ops-chip__label">Bimestre vigente</span>
                <strong>B{{ store.currentBimester }}</strong>
              </div>
            </div>
          </div>

          <CButton
            v-if="showOpsLink"
            color="primary"
            class="academic-risk-ops-card__dash-btn"
            @click="$emit('go-operational')"
          >
            <i class="fas fa-table me-2"></i>
            Vista operativa
          </CButton>
        </div>
      </div>

      <hr class="academic-risk-ops-card__divider" />

      <div class="academic-risk-filters__row">
        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-calendar-week me-1" aria-hidden="true"></i>
            Bimestre (consulta)
          </CFormLabel>
          <CFormSelect
            :model-value="store.filters.bimester"
            :disabled="store.loading || !store.bimesters.length"
            @change="onBimester"
          >
            <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div
          v-if="!store.scope.isStudentView"
          class="academic-risk-filters__field"
        >
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-graduation-cap me-1" aria-hidden="true"></i>
            Grado
          </CFormLabel>
          <CFormSelect
            :model-value="store.filters.grade ?? 'all'"
            :disabled="store.loading || !store.gradeOptions.length"
            @change="onGrade"
          >
            <option value="all">Todas</option>
            <option v-for="g in store.gradeOptions" :key="g" :value="g">{{ g }}°</option>
          </CFormSelect>
        </div>

        <div
          v-if="!store.scope.isStudentView"
          class="academic-risk-filters__field"
        >
          <CFormLabel class="academic-risk-filters__label">
            <i class="fas fa-door-open me-1" aria-hidden="true"></i>
            Sección
          </CFormLabel>
          <CFormSelect
            :model-value="store.filters.section ?? 'all'"
            :disabled="store.loading"
            @change="onSection"
          >
            <option value="all">Todas</option>
            <option v-for="s in store.sectionOptions" :key="s" :value="s">{{ s }}</option>
          </CFormSelect>
        </div>

        <div class="academic-risk-filters__actions">
          <CButton
            color="primary"
            class="academic-risk-ops-card__update-btn"
            :disabled="store.loading || !store.canQuery"
            @click="$emit('apply')"
          >
            <i class="fas fa-search me-2"></i>
            Consultar
          </CButton>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'

defineProps({
  title: { type: String, default: 'Dashboard de predicción' },
  eyebrow: { type: String, default: 'Alerta temprana · Machine Learning' },
  description: {
    type: String,
    default: 'Visión general del riesgo académico por bimestre y aula, con alertas prioritarias.',
  },
  iconClass: { type: String, default: 'fas fa-chart-pie' },
  showOpsLink: { type: Boolean, default: true },
})

defineEmits(['apply', 'go-operational'])

const store = useAcademicRiskDashboardStore()

const onBimester = (event) => {
  store.onBimesterChange(Number(event.target.value))
}

const onGrade = (event) => {
  store.onGradeChange(event.target.value)
}

const onSection = (event) => {
  store.onSectionChange(event.target.value)
}
</script>

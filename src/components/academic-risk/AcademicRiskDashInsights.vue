<template>
  <CRow class="g-3 mb-4">
    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 h-100">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center gap-2">
            <h6 class="fw-bold mb-0">
              <i class="fas fa-flask me-2"></i>
              Factores más frecuentes
            </h6>
            <CBadge color="primary">{{ factors.length }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!previewFactors.length" class="risk-empty">Sin factores en el alcance.</div>
          <div v-else class="risk-rank-list">
            <div
              v-for="item in previewFactors"
              :key="item.factor_name"
              class="risk-rank-item risk-rank-item--static"
            >
              <div class="risk-rank-item__main">
                <span class="risk-rank-item__rank">#{{ item.rank }}</span>
                <div>
                  <strong>{{ formatFactorName(item.factor_name) }}</strong>
                  <span class="d-block text-body-secondary small">
                    {{ item.students_affected }} alumno(s)
                  </span>
                </div>
              </div>
              <span class="risk-rank-item__meta">{{ item.count }}×</span>
            </div>
          </div>
          <CButton
            v-if="factors.length > previewLimit"
            color="secondary"
            variant="outline"
            size="sm"
            class="mt-3"
            @click="$emit('open-all', 'factors')"
          >
            Ver todos ({{ factors.length }})
          </CButton>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xs="12" lg="6">
      <CCard class="shadow-sm border-0 h-100">
        <CCardHeader class="bg-white border-0 pt-3 pb-0 px-4">
          <div class="d-flex justify-content-between align-items-center gap-2">
            <h6 class="fw-bold mb-0">
              <i class="fas fa-lightbulb me-2"></i>
              Recomendaciones más comunes
            </h6>
            <CBadge color="info">{{ recommendations.length }}</CBadge>
          </div>
        </CCardHeader>
        <CCardBody class="px-4 pb-4">
          <div v-if="!previewRecommendations.length" class="risk-empty">
            Sin recomendaciones en el alcance.
          </div>
          <div v-else class="risk-rank-list">
            <div
              v-for="item in previewRecommendations"
              :key="`${item.category}-${item.title}`"
              class="risk-rank-item risk-rank-item--static"
            >
              <div class="risk-rank-item__main">
                <span class="risk-rank-item__rank">#{{ item.rank }}</span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span class="d-block text-body-secondary small">
                    {{ getCategoryLabel(item.category) }} · {{ item.students_affected }} alumno(s)
                  </span>
                </div>
              </div>
              <span class="risk-rank-item__meta">{{ item.count }}×</span>
            </div>
          </div>
          <CButton
            v-if="recommendations.length > previewLimit"
            color="secondary"
            variant="outline"
            size="sm"
            class="mt-3"
            @click="$emit('open-all', 'recommendations')"
          >
            Ver todos ({{ recommendations.length }})
          </CButton>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryLabel, formatFactorName } from '@/utils/academicRisk'

const props = defineProps({
  factors: { type: Array, default: () => [] },
  recommendations: { type: Array, default: () => [] },
  previewLimit: { type: Number, default: 10 },
})

defineEmits(['open-all'])

const previewFactors = computed(() => props.factors.slice(0, props.previewLimit))
const previewRecommendations = computed(() => props.recommendations.slice(0, props.previewLimit))
</script>

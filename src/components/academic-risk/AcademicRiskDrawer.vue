<template>
  <COffcanvas
    placement="end"
    :visible="visible"
    @hide="$emit('close')"
  >
    <COffcanvasHeader>
      <COffcanvasTitle>Detalle de predicción</COffcanvasTitle>
      <CCloseButton class="text-reset" @click="$emit('close')" />
    </COffcanvasHeader>

    <COffcanvasBody v-if="row">
      <CCard class="border-0 shadow-sm mb-3">
        <CCardBody>
          <h6 class="fw-bold mb-3">Información general</h6>
          <div class="detail-grid">
            <div><span class="detail-label">Nombre</span><div>{{ row.fullName }}</div></div>
            <div><span class="detail-label">Código</span><div>{{ row.studentCode }}</div></div>
            <div><span class="detail-label">Aula</span><div>{{ row.classroomLabel }}</div></div>
            <div><span class="detail-label">Bimestre</span><div>{{ bimesterLabel }}</div></div>
            <div><span class="detail-label">Modelo utilizado</span><div>{{ modelLabel }}</div></div>
            <div>
              <span class="detail-label">Nivel de riesgo</span>
              <div>
                <span v-if="row.riskLevel" :class="getRiskChipClass(row.riskLevel)">
                  {{ getRiskLabel(row.riskLevel) }}
                </span>
                <span v-else>—</span>
              </div>
            </div>
            <div><span class="detail-label">Confianza</span><div>{{ formatConfidence(row.confidence) }}</div></div>
            <div><span class="detail-label">Fecha de predicción</span><div>{{ formatDateTime(row.lastUpdated) }}</div></div>
          </div>
        </CCardBody>
      </CCard>

      <CCard class="border-0 shadow-sm mb-3">
        <CCardHeader class="bg-white fw-bold">Factores que más influyeron</CCardHeader>
        <CCardBody>
          <AcademicRiskFactors
            v-if="row.prediction?.factors?.length"
            :factors="row.prediction.factors"
          />
          <div v-else class="text-body-secondary">No hay factores registrados.</div>
        </CCardBody>
      </CCard>

      <CCard class="border-0 shadow-sm">
        <CCardHeader class="bg-white fw-bold">Recomendaciones</CCardHeader>
        <CCardBody>
          <AcademicRiskRecommendations
            :recommendations="row.prediction?.recommendations || []"
          />
        </CCardBody>
      </CCard>
    </COffcanvasBody>
  </COffcanvas>
</template>

<script setup>
import { computed } from 'vue'

import AcademicRiskFactors from '@/components/academic-risk/AcademicRiskFactors.vue'
import AcademicRiskRecommendations from '@/components/academic-risk/AcademicRiskRecommendations.vue'
import {
  formatConfidence,
  formatDateTime,
  getRiskChipClass,
  getRiskLabel,
} from '@/utils/academicRisk'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  row: {
    type: Object,
    default: null,
  },
  bimester: {
    type: Number,
    default: null,
  },
})

defineEmits(['close'])

const bimesterLabel = computed(() => (
  props.bimester ? `Bimestre ${props.bimester}` : '—'
))

const modelLabel = computed(() => {
  const model = props.row?.prediction?.prediction_model
  if (!model) return '—'
  return `modelo_${model.toLowerCase()}.pkl`
})
</script>

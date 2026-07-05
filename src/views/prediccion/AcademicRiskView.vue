<template>
  <div class="academic-risk-view">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <h4 class="fw-bold text-primary mb-0">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Sistema de Alerta Temprana de Riesgo Académico
            </h4>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <AcademicRiskFilters @update-predictions="confirmUpdate" />

    <AcademicRiskSummary :summary="store.summary" />

    <AcademicRiskTable
      :rows="store.filteredRows"
      :loading="store.loading"
      :error="store.error"
      :connection-error="store.connectionError"
      @view-detail="store.openDetail"
    />

    <AcademicRiskDrawer
      :visible="store.drawerVisible"
      :row="store.selectedRow"
      :bimester="store.filters.bimester"
      @close="store.closeDetail"
    />

    <div v-if="store.updating" class="academic-risk-overlay">
      <div class="academic-risk-overlay__content">
        <CSpinner color="light" class="mb-3" />
        <h5 class="text-white mb-2">Generando predicciones...</h5>
        <p class="text-white-50 mb-3">El modelo de Machine Learning está procesando el aula seleccionada.</p>
        <CProgress animated :value="100" color="light" class="academic-risk-overlay__progress" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

import AcademicRiskDrawer from '@/components/academic-risk/AcademicRiskDrawer.vue'
import AcademicRiskFilters from '@/components/academic-risk/AcademicRiskFilters.vue'
import AcademicRiskSummary from '@/components/academic-risk/AcademicRiskSummary.vue'
import AcademicRiskTable from '@/components/academic-risk/AcademicRiskTable.vue'
import { useAcademicRiskStore } from '@/stores/academicRisk'
import { toastError, toastSuccess } from '@/utils/alerts'

const store = useAcademicRiskStore()

const confirmUpdate = async () => {
  const result = await Swal.fire({
    title: '¿Desea actualizar las predicciones?',
    html: 'Se ejecutará nuevamente el modelo de Machine Learning para el bimestre seleccionado.<br><br>Puede tardar algunos segundos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    await store.updatePredictions()
    toastSuccess('Predicciones actualizadas correctamente.')
  } catch (err) {
    toastError(store.error || 'No se pudieron actualizar las predicciones.')
  }
}

onMounted(() => {
  store.initializeFilters()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>

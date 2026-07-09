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

    <AcademicRiskFilters
      @update-predictions="confirmUpdate"
      @close-bimester="confirmCloseBimester"
      @reopen-bimester="confirmReopenBimester"
    />

    <AcademicRiskSummary v-if="!store.scope.isStudentView" :summary="store.summary" />

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

const buildMissingFieldsHtml = (missingFields = []) => {
  if (!missingFields.length) return ''
  const items = missingFields.map((field) => `<li>${field}</li>`).join('')
  return `<p class="mb-2">Información faltante:</p><ul class="text-start mb-0">${items}</ul>`
}

const showPredictionError = (err) => {
  const payload = err.validationPayload || err.response?.data || {}
  const missingFields = payload.missing_fields || []
  const message = payload.message || store.error || 'No se pudieron actualizar las predicciones.'

  if (missingFields.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      html: `<p>${message}</p>${buildMissingFieldsHtml(missingFields)}`,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#321fdb',
    })
    return
  }

  toastError(message)
}

const confirmUpdate = async () => {
  const result = await Swal.fire({
    title: '¿Desea actualizar las predicciones?',
    html: 'Se ejecutará el modelo de Machine Learning para el bimestre seleccionado.<br><br>El bimestre debe estar cerrado y todos los datos deben estar completos.',
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
    showPredictionError(err)
  }
}

const confirmCloseBimester = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar bimestre?',
    html: 'Al cerrar el bimestre, las competencias, faltas, tardanzas, conducta y perfil social quedarán bloqueadas para edición.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Cerrar bimestre',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#f9b115',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    await store.closeBimester()
    toastSuccess('Bimestre cerrado correctamente.')
  } catch (err) {
    toastError(err.response?.data?.message || 'No se pudo cerrar el bimestre.')
  }
}

const confirmReopenBimester = async () => {
  const result = await Swal.fire({
    title: '¿Reabrir bimestre?',
    html: 'Las variables académicas volverán a ser editables para este bimestre.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Reabrir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#321fdb',
    cancelButtonColor: '#9da5b1',
  })

  if (!result.isConfirmed) return

  try {
    await store.reopenBimester()
    toastSuccess('Bimestre reabierto correctamente.')
  } catch (err) {
    toastError(err.response?.data?.message || 'No se pudo reabrir el bimestre.')
  }
}

onMounted(() => {
  store.initializeFilters()
})
</script>

<style lang="scss">
@import '@/styles/academic-risk.scss';
</style>

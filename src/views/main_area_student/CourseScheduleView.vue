<template>
  <div class="module-page course-schedule">
    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando horario...
    </div>

    <EmptyState
      v-else-if="!schedules.length"
      icon="🕒"
      title="Sin horario configurado"
      hint="Cuando dirección o secretaría registren el horario de esta área, aparecerá aquí."
    />

    <div v-else class="modern-table-shell">
      <CTable class="mb-0" hover responsive>
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell>Día</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Inicio</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Fin</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="slot in schedules" :key="slot.id || `${slot.day_of_week}-${slot.start_time}`">
            <CTableDataCell>{{ slot.day_label || dayLabel(slot.day_of_week) }}</CTableDataCell>
            <CTableDataCell class="text-center">{{ slot.start_time }}</CTableDataCell>
            <CTableDataCell class="text-center">{{ slot.end_time }}</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ScheduleService from '@/services/ScheduleService'
import EmptyState from '@/components/academic/EmptyState.vue'

const DAY_LABELS = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
}

const route = useRoute()
const courseClassId = Number(route.params.courseClass)
const loading = ref(true)
const loadError = ref('')
const schedules = ref([])

const dayLabel = (day) => DAY_LABELS[Number(day)] || `Día ${day}`

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await ScheduleService.listByCourseClass(courseClassId)
    if (response.data?.success === false) {
      loadError.value = response.data?.message || 'No se pudo cargar el horario.'
      schedules.value = []
      return
    }
    schedules.value = response.data?.data?.schedules || []
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar el horario.'
  } finally {
    loading.value = false
  }
})
</script>

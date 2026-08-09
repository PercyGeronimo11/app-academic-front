<template>
  <div class="schedules-panel">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <h5 class="mb-1">Horarios del periodo activo</h5>
        <p class="mb-0 text-body-secondary small">
          Periodo:
          <strong>{{ periodLabel }}</strong>
          <span class="ms-1">(solo lectura)</span>
        </p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <label class="mb-0 text-body-secondary">Aula:</label>
        <select
          v-model="selectedAulaId"
          class="form-select form-select-sm schedules-aula-select"
          :disabled="loading || !aulas.length"
          @change="loadSchedules"
        >
          <option value="">Todas</option>
          <option v-for="aula in aulas" :key="aula.id" :value="String(aula.id)">
            {{ aula.label }}
          </option>
        </select>
      </div>
    </div>

    <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>

    <ElegantCrudList
      v-else
      :columns="columns"
      :data="rows"
      empty-message="No hay horarios registrados para el periodo activo con el filtro actual."
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import ScheduleService from '@/services/ScheduleService'

const loading = ref(false)
const errorMessage = ref('')
const period = ref(null)
const aulas = ref([])
const schedules = ref([])
const selectedAulaId = ref('')

const columns = [
  { key: 'day_label', label: 'Día' },
  { key: 'start_time', label: 'Inicio' },
  { key: 'end_time', label: 'Fin' },
  { key: 'course_name', label: 'Curso' },
  { key: 'teacher_name', label: 'Docente' },
  { key: 'aula', label: 'Aula' },
]

const periodLabel = computed(() => period.value?.name || '—')

const rows = computed(() =>
  (schedules.value || []).map((item) => ({
    ...item,
    teacher_name: item.teacher_name || '—',
    course_name: item.course_name || '—',
    aula: item.aula || `${item.grade || ''}° ${item.section || ''}`.trim(),
  })),
)

const loadSchedules = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const params = {}
    if (selectedAulaId.value) {
      params.grade_section_id = Number(selectedAulaId.value)
    }
    const response = await ScheduleService.list(params)
    const data = response.data?.data || {}
    period.value = data.period || null
    aulas.value = data.aulas || []
    schedules.value = data.schedules || []
  } catch (error) {
    period.value = null
    schedules.value = []
    errorMessage.value =
      error.response?.data?.message || 'No se pudieron cargar los horarios del periodo activo.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSchedules()
})
</script>

<style scoped>
.schedules-aula-select {
  min-width: 9rem;
}
</style>

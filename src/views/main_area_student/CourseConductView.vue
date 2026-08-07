<template>
  <div class="module-page course-conduct">
    <div class="module-filter-bar">
      <div style="max-width: 280px">
        <CFormLabel for="conduct-bimester">Bimestre</CFormLabel>
        <CFormSelect
          id="conduct-bimester"
          :model-value="selectedBimesterId"
          @update:model-value="onBimesterChange"
        >
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }}
          </option>
        </CFormSelect>
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando incidentes...
    </div>

    <EmptyState
      v-else-if="!incidents.length"
      icon="✅"
      title="Sin incidentes de conducta"
      hint="No hay registros de conducta para este curso en el bimestre seleccionado."
    />

    <div v-else class="modern-table-shell">
      <CTable class="mb-0" hover responsive>
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell>Fecha</CTableHeaderCell>
            <CTableHeaderCell>Tipo</CTableHeaderCell>
            <CTableHeaderCell>Severidad</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Docente</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="item in incidents" :key="item.id">
            <CTableDataCell>{{ formatDate(item.incident_date) }}</CTableDataCell>
            <CTableDataCell>{{ typeLabel(item.incident_type) }}</CTableDataCell>
            <CTableDataCell>
              <span class="priority-badge" :class="severityClass(item.severity)">
                {{ severityLabel(item.severity) }}
              </span>
            </CTableDataCell>
            <CTableDataCell>{{ item.description }}</CTableDataCell>
            <CTableDataCell>{{ item.teacher_name || '—' }}</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ConductIncidentService from '@/services/ConductIncidentService'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import EmptyState from '@/components/academic/EmptyState.vue'
import { filterActivePeriodBimesters, pickCurrentBimesterId } from '@/utils/bimester'

const typeLabels = {
  comportamiento_inadecuado: 'Comportamiento inadecuado',
  agresion: 'Agresión',
  irrespeto: 'Irrespeto',
  uso_celular: 'Uso de celular',
  otro: 'Otro',
}

const severityLabels = {
  leve: 'Leve',
  moderado: 'Moderado',
  grave: 'Grave',
  muy_grave: 'Muy grave',
  critico: 'Crítico',
}

const route = useRoute()
const courseClassId = Number(route.params.courseClass)

const loading = ref(true)
const loadError = ref('')
const incidents = ref([])
const bimesters = ref([])
const selectedBimesterId = ref(null)

const typeLabel = (v) => typeLabels[v] || v
const severityLabel = (v) => severityLabels[v] || v
const severityClass = (v) => {
  if (v === 'critico' || v === 'muy_grave') return 'priority-badge--urgente'
  if (v === 'grave' || v === 'moderado') return 'priority-badge--importante'
  return 'priority-badge--normal'
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('es-PE')
  } catch {
    return value
  }
}

const loadIncidents = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await ConductIncidentService.myHistory(
      selectedBimesterId.value,
      courseClassId
    )
    incidents.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar incidentes.'
    incidents.value = []
  } finally {
    loading.value = false
  }
}

const onBimesterChange = async (value) => {
  selectedBimesterId.value = value != null && value !== '' ? Number(value) : null
  await loadIncidents()
}

onMounted(async () => {
  try {
    const bimesterRes = await CompetencyScoreService.listBimesters()
    bimesters.value = filterActivePeriodBimesters(bimesterRes.data?.data || [])
    selectedBimesterId.value = pickCurrentBimesterId(bimesters.value)
  } catch (error) {
    console.error(error)
  }
  await loadIncidents()
})
</script>

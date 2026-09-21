<template>
  <div class="module-page course-conduct">
    <div class="module-filter-bar course-conduct__filters">
      <div class="course-conduct__field">
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
      <div class="course-conduct__field">
        <CFormLabel for="conduct-date-from">Desde</CFormLabel>
        <CFormInput id="conduct-date-from" v-model="dateFrom" type="date" />
      </div>
      <div class="course-conduct__field">
        <CFormLabel for="conduct-date-to">Hasta</CFormLabel>
        <CFormInput id="conduct-date-to" v-model="dateTo" type="date" />
      </div>
      <div class="course-conduct__field course-conduct__field--grow">
        <CFormLabel for="conduct-type">Tipo de incidencia</CFormLabel>
        <CFormSelect id="conduct-type" v-model="incidentType">
          <option value="">Todos</option>
          <option v-for="opt in incidentTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
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
      hint="No hay incidentes de conducta propios que coincidan con los filtros."
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
import { onMounted, ref, watch } from 'vue'
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

const incidentTypeOptions = [
  { value: 'comportamiento_inadecuado', label: 'Comportamiento inadecuado' },
  { value: 'agresion', label: 'Agresión' },
  { value: 'irrespeto', label: 'Irrespeto' },
  { value: 'uso_celular', label: 'Uso de celular' },
  { value: 'otro', label: 'Otro' },
]

const route = useRoute()
const courseClassId = Number(route.params.courseClass)

const loading = ref(true)
const loadError = ref('')
const incidents = ref([])
const bimesters = ref([])
const selectedBimesterId = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const incidentType = ref('')

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
      courseClassId,
      {
        dateFrom: dateFrom.value || null,
        dateTo: dateTo.value || null,
        incidentType: incidentType.value || null,
      }
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

watch([dateFrom, dateTo, incidentType], () => {
  loadIncidents()
})
</script>

<style scoped>
.course-conduct__filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.course-conduct__field,
.course-conduct__field--grow {
  min-width: 0;
}

@media (min-width: 768px) {
  .course-conduct__filters {
    grid-template-columns: minmax(0, 180px) minmax(0, 150px) minmax(0, 150px) minmax(0, 1fr);
    align-items: end;
  }
}
</style>

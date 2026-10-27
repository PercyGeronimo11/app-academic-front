<template>
  <div class="module-page course-conduct">
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
            <CTableHeaderCell>Docente</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
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
            <CTableDataCell>{{ item.teacher_name || '—' }}</CTableDataCell>
            <CTableDataCell class="text-center">
              <CButton
                color="info"
                variant="outline"
                class="conduct-action-btn"
                title="Ver detalle"
                aria-label="Ver detalle del incidente"
                @click="openDetail(item)"
              >
                <i class="fas fa-eye" aria-hidden="true"></i>
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <ModalStudentConductDetail
      :visible="detailOpen"
      :incident="selectedIncident"
      :type-label="typeLabel"
      :severity-label="severityLabel"
      :status-label="statusLabel"
      :format-date="formatDate"
      @close="closeDetail"
    />
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConductIncidentService from '@/services/ConductIncidentService'
import EmptyState from '@/components/academic/EmptyState.vue'
import ModalStudentConductDetail from './modals/ModalStudentConductDetail.vue'

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

const statusLabels = {
  notificado: 'Notificado',
  registrado: 'Registrado',
  cerrado: 'Cerrado',
}

const route = useRoute()
const courseClassId = Number(route.params.courseClass)
const selectedBimesterId = inject('studentBimesterId', ref(null))

const loading = ref(true)
const loadError = ref('')
const incidents = ref([])
const detailOpen = ref(false)
const selectedIncident = ref(null)

const typeLabel = (v) => typeLabels[v] || v || '—'
const severityLabel = (v) => severityLabels[v] || v || '—'
const statusLabel = (v) => statusLabels[v] || (v ? String(v).replace(/_/g, ' ') : '—')
const severityClass = (v) => {
  if (v === 'critico' || v === 'muy_grave') return 'priority-badge--urgente'
  if (v === 'grave' || v === 'moderado') return 'priority-badge--importante'
  return 'priority-badge--normal'
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE')
  } catch {
    return value
  }
}

const loadIncidents = async () => {
  if (!selectedBimesterId.value) {
    loading.value = false
    incidents.value = []
    return
  }
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

const openDetail = (item) => {
  selectedIncident.value = item
  detailOpen.value = true
}

const closeDetail = () => {
  detailOpen.value = false
  selectedIncident.value = null
}

watch(selectedBimesterId, () => {
  closeDetail()
  loadIncidents()
}, { immediate: true })
</script>

<style scoped>
.conduct-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
}
</style>

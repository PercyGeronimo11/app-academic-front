<template>
  <div class="conduct-page">
    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <template v-else>
      <EmptyState
        v-if="!incidents.length"
        icon="✅"
        title="Sin incidentes registrados"
        hint="Los incidentes que registre en este curso aparecerán aquí."
        compact
      />
      <div v-else class="modern-table-shell mb-4">
        <CTable hover responsive class="mb-0">
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">#</CTableHeaderCell>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Alumno</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Gravedad</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(item, index) in incidents" :key="item.id">
              <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
              <CTableDataCell>{{ item.incident_date }}</CTableDataCell>
              <CTableDataCell class="fw-semibold">{{ item.student_name }}</CTableDataCell>
              <CTableDataCell>{{ typeLabel(item.incident_type) }}</CTableDataCell>
              <CTableDataCell>
                <span class="priority-badge" :class="severityBadgeClass(item.severity)">
                  {{ severityLabel(item.severity) }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton
                  color="info"
                  variant="outline"
                  size="sm"
                  title="Ver detalle"
                  @click="openDetail(item)"
                >
                  <i class="fas fa-eye"></i>
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </template>

    <ModalConductIncident
      :visible="isRegisterOpen"
      :course-class-id="courseClassId"
      :bimester-id="activeBimesterId"
      @close="closeRegister"
      @saved="onIncidentSaved"
    />

    <ModalConductIncidentDetail
      :visible="isDetailOpen"
      :incident="selectedIncident"
      :type-label="typeLabel"
      :severity-label="severityLabel"
      @close="closeDetail"
    />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConductIncidentService from '@/services/ConductIncidentService'
import ModalConductIncident from './modals/ModalConductIncident.vue'
import ModalConductIncidentDetail from './modals/ModalConductIncidentDetail.vue'
import EmptyState from '@/components/academic/EmptyState.vue'

const route = useRoute()
const courseClassId = Number(route.params.courseClass)

const conductBimesterId = inject('conductBimesterId', ref(null))
const conductRegisterSignal = inject('conductRegisterSignal', ref(0))
const setCourseStudentsCount = inject('setCourseStudentsCount', null)

const incidents = ref([])
const loading = ref(false)
const loadError = ref('')
const isRegisterOpen = ref(false)
const isDetailOpen = ref(false)
const selectedIncident = ref(null)

const activeBimesterId = computed(() => {
  const value = conductBimesterId?.value
  return value != null && value !== '' ? Number(value) : null
})

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

const typeLabel = (v) => typeLabels[v] || v
const severityLabel = (v) => severityLabels[v] || v
const severityBadgeClass = (v) => {
  if (v === 'critico' || v === 'muy_grave') return 'priority-badge--urgente'
  if (v === 'grave' || v === 'moderado') return 'priority-badge--importante'
  return 'priority-badge--normal'
}

const fetchIncidents = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await ConductIncidentService.listByCourse(
      courseClassId,
      activeBimesterId.value
    )
    if (response.data?.success) {
      incidents.value = response.data.data ?? []
    } else {
      incidents.value = []
      loadError.value = response.data?.message || 'No se pudieron cargar los incidentes.'
    }
  } catch (error) {
    incidents.value = []
    loadError.value = error.response?.data?.message || 'Error al cargar los datos.'
  } finally {
    loading.value = false
  }
}

const syncStudentsCount = async () => {
  try {
    const response = await ConductIncidentService.listStudentsByCourse(courseClassId)
    const rows = response.data?.data?.students ?? []
    setCourseStudentsCount?.(rows.length)
  } catch {
    /* ignore */
  }
}

const closeRegister = () => {
  isRegisterOpen.value = false
}

const openDetail = (item) => {
  selectedIncident.value = item
  isDetailOpen.value = true
}

const closeDetail = () => {
  isDetailOpen.value = false
  selectedIncident.value = null
}

const onIncidentSaved = async () => {
  await fetchIncidents()
}

watch(
  activeBimesterId,
  (id) => {
    if (id) fetchIncidents()
  },
  { immediate: true }
)

watch(
  () => conductRegisterSignal?.value,
  (signal, prev) => {
    if (signal && signal !== prev) isRegisterOpen.value = true
  }
)

onMounted(syncStudentsCount)
</script>

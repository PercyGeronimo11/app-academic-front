<template>
  <div class="conduct-page">
    <div class="module-filter-bar conduct-filters">
      <div class="conduct-filters__field">
        <CFormLabel for="conduct-date-from">Desde</CFormLabel>
        <CFormInput id="conduct-date-from" v-model="dateFrom" type="date" />
      </div>
      <div class="conduct-filters__field">
        <CFormLabel for="conduct-date-to">Hasta</CFormLabel>
        <CFormInput id="conduct-date-to" v-model="dateTo" type="date" />
      </div>
      <div class="conduct-filters__field">
        <CFormLabel for="conduct-type">Tipo de incidencia</CFormLabel>
        <CFormSelect id="conduct-type" v-model="incidentType">
          <option value="">Todos</option>
          <option v-for="opt in incidentTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </CFormSelect>
      </div>
      <div class="conduct-filters__field conduct-filters__field--grow">
        <CFormLabel for="conduct-student">Alumno</CFormLabel>
        <CFormSelect id="conduct-student" v-model="studentId">
          <option value="">Todos</option>
          <option v-for="student in students" :key="student.student_id" :value="String(student.student_id)">
            {{ student.student_name }}
          </option>
        </CFormSelect>
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <template v-else>
      <EmptyState
        v-if="!incidents.length"
        icon="✅"
        title="Sin incidentes registrados"
        hint="No hay incidentes que coincidan con los filtros seleccionados."
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
const students = ref([])
const loading = ref(false)
const loadError = ref('')
const isRegisterOpen = ref(false)
const isDetailOpen = ref(false)
const selectedIncident = ref(null)

const dateFrom = ref('')
const dateTo = ref('')
const incidentType = ref('')
const studentId = ref('')

const incidentTypeOptions = [
  { value: 'comportamiento_inadecuado', label: 'Comportamiento inadecuado' },
  { value: 'agresion', label: 'Agresión' },
  { value: 'irrespeto', label: 'Irrespeto' },
  { value: 'uso_celular', label: 'Uso de celular' },
  { value: 'otro', label: 'Otro' },
]

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

const currentFilters = () => ({
  dateFrom: dateFrom.value || null,
  dateTo: dateTo.value || null,
  incidentType: incidentType.value || null,
  studentId: studentId.value ? Number(studentId.value) : null,
})

const fetchIncidents = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await ConductIncidentService.listByCourse(
      courseClassId,
      activeBimesterId.value,
      currentFilters()
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
    students.value = rows
    setCourseStudentsCount?.(rows.length)
  } catch {
    students.value = []
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

watch([dateFrom, dateTo, incidentType, studentId], () => {
  if (activeBimesterId.value) fetchIncidents()
})

watch(
  () => conductRegisterSignal?.value,
  (signal, prev) => {
    if (signal && signal !== prev) isRegisterOpen.value = true
  }
)

onMounted(syncStudentsCount)
</script>

<style scoped>
.conduct-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.conduct-filters__field,
.conduct-filters__field--grow {
  min-width: 0;
}

@media (min-width: 768px) {
  .conduct-filters {
    grid-template-columns: minmax(0, 140px) minmax(0, 140px) minmax(0, 200px) minmax(0, 1fr);
    align-items: end;
  }
}
</style>

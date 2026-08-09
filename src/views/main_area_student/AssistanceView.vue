<template>
  <div class="module-page student-assistance">
    <div class="summary-grid">
      <div class="summary-card summary-card--present">
        <span class="summary-card__label">Presentes</span>
        <strong class="summary-card__value">{{ summary.present }}</strong>
      </div>
      <div class="summary-card summary-card--late">
        <span class="summary-card__label">Tardanzas</span>
        <strong class="summary-card__value">{{ summary.late }}</strong>
      </div>
      <div class="summary-card summary-card--absent">
        <span class="summary-card__label">Faltas</span>
        <strong class="summary-card__value">{{ summary.absent }}</strong>
      </div>
      <div class="summary-card summary-card--link">
        <span class="summary-card__label">Notas</span>
        <router-link class="summary-card__cta" to="/courses/student/academic-record">
          Ver Record Académico
          <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <div class="module-filter-bar">
      <div style="max-width: 240px">
        <CFormLabel for="assist-bimester">Bimestre</CFormLabel>
        <CFormSelect
          id="assist-bimester"
          :model-value="selectedBimesterId"
          @update:model-value="onBimesterChange"
        >
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }}
          </option>
        </CFormSelect>
      </div>
      <div style="max-width: 180px">
        <CFormLabel for="date-from">Desde</CFormLabel>
        <CFormInput id="date-from" v-model="dateFrom" type="date" />
      </div>
      <div style="max-width: 180px">
        <CFormLabel for="date-to">Hasta</CFormLabel>
        <CFormInput id="date-to" v-model="dateTo" type="date" />
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando asistencias...
    </div>

    <template v-else>
      <div class="modern-table-shell">
        <CTable class="mb-0" hover responsive>
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Hora</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="!pagedRows.length">
              <CTableDataCell colspan="3" class="list-empty-message py-4 text-center">
                No hay registros para mostrar.
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-for="row in pagedRows" :key="`${row.date_assistance}-${row.status}`">
              <CTableDataCell class="text-center">{{ formatDate(row.date_assistance) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.time || '—' }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CBadge :class="colorEstado(row.status)" class="assist-badge-sm">
                  {{ textoEstado(row.status) }}
                </CBadge>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>

      <div
        v-if="filteredRows.length > pageSize"
        class="modern-list-pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3"
      >
        <span class="text-body-secondary small">
          {{ filteredRows.length }} registro(s) · página {{ currentPage }} de {{ totalPages }}
        </span>
        <CPagination class="mb-0" aria-label="Paginación de asistencias">
          <CPaginationItem :disabled="currentPage <= 1" @click="currentPage = Math.max(1, currentPage - 1)">
            Anterior
          </CPaginationItem>
          <CPaginationItem
            v-for="page in visiblePages"
            :key="page"
            :active="page === currentPage"
            @click="currentPage = page"
          >
            {{ page }}
          </CPaginationItem>
          <CPaginationItem
            :disabled="currentPage >= totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            Siguiente
          </CPaginationItem>
        </CPagination>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import { textoEstado, colorEstado, esFalta, ESTADOS_ASISTENCIA } from '@/utils/utils'
import {
  filterActivePeriodBimesters,
  isDateInBimester,
  pickCurrentBimesterId,
} from '@/utils/bimester'

const route = useRoute()
const courseClassId = Number(route.params.courseClass)

const loading = ref(true)
const loadError = ref('')
const allRows = ref([])
const bimesters = ref([])
const selectedBimesterId = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const pageSize = 10

const selectedBimester = computed(() =>
  bimesters.value.find((b) => Number(b.id) === Number(selectedBimesterId.value)) || null
)

const filteredRows = computed(() => {
  return allRows.value.filter((row) => {
    const date = String(row.date_assistance || '').slice(0, 10)
    if (!isDateInBimester(date, selectedBimester.value)) return false
    if (dateFrom.value && date < dateFrom.value) return false
    if (dateTo.value && date > dateTo.value) return false
    return true
  })
})

const summary = computed(() => {
  let present = 0
  let late = 0
  let absent = 0
  for (const row of filteredRows.value) {
    const status = row.status
    if (status === ESTADOS_ASISTENCIA.ASISTENCIA || status === 'asistio') {
      present += 1
    } else if (esFalta(status)) {
      absent += 1
    } else if (
      [
        ESTADOS_ASISTENCIA.TARDANZA_LEVE,
        ESTADOS_ASISTENCIA.TARDANZA_MODERADA,
        ESTADOS_ASISTENCIA.TARDANZA_GRAVE,
        ESTADOS_ASISTENCIA.TARDANZA_EXTREMA,
        'T',
        'tardanza',
      ].includes(status)
    ) {
      late += 1
    }
  }
  return { present, late, absent }
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  const from = Math.max(1, current - 2)
  const to = Math.min(total, current + 2)
  for (let i = from; i <= to; i += 1) pages.push(i)
  return pages
})

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('es-PE')
  } catch {
    return value
  }
}

const onBimesterChange = (value) => {
  selectedBimesterId.value = value != null && value !== '' ? Number(value) : null
  currentPage.value = 1
  const b = selectedBimester.value
  dateFrom.value = b?.start_date ? String(b.start_date).slice(0, 10) : ''
  dateTo.value = b?.end_date ? String(b.end_date).slice(0, 10) : ''
}

watch([dateFrom, dateTo], () => {
  currentPage.value = 1
})

watch(filteredRows, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [bimesterRes, assistRes] = await Promise.all([
      CompetencyScoreService.listBimesters(),
      AssistanceService.listAssistanceFromStudent(courseClassId),
    ])
    bimesters.value = filterActivePeriodBimesters(bimesterRes.data?.data || [])
    selectedBimesterId.value = pickCurrentBimesterId(bimesters.value)
    const b = selectedBimester.value
    dateFrom.value = b?.start_date ? String(b.start_date).slice(0, 10) : ''
    dateTo.value = b?.end_date ? String(b.end_date).slice(0, 10) : ''

    const rows = Array.isArray(assistRes.data?.data) ? assistRes.data.data : []
    allRows.value = rows
      .slice()
      .sort((a, b) => String(b.date_assistance).localeCompare(String(a.date_assistance)))
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar asistencias.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--rp-space-3);
  margin-bottom: var(--rp-space-4);
}

.summary-card {
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  padding: 0.85rem 1rem;
  box-shadow: var(--rp-shadow-xs);
}

.summary-card__label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-subtle);
  margin-bottom: 0.25rem;
}

.summary-card__value {
  font-size: 1.5rem;
  color: var(--rp-text-heading);
  line-height: 1.1;
}

.summary-card--present {
  border-color: #86efac;
}

.summary-card--late {
  border-color: #fdba74;
}

.summary-card--absent {
  border-color: #fca5a5;
}

.summary-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-brand-600);
  text-decoration: none;
  margin-top: 0.2rem;
}

.summary-card__cta:hover {
  text-decoration: underline;
}
</style>

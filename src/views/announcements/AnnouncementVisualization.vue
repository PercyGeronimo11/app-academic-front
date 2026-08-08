<template>
  <div class="module-page announcement-visualization">
    <ModulePageHeader
      icon="fas fa-chart-bar"
      :title="headerTitle"
      :subtitle="headerSubtitle"
    >
      <template #actions>
        <CButton color="secondary" variant="outline" @click="goBack">
          <i class="fas fa-arrow-left me-2"></i>Volver
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando visualización...
    </div>

    <template v-else-if="announcement">
      <div class="viz-summary mb-3">
        <div class="viz-summary__card">
          <span class="viz-summary__label">Destinatarios</span>
          <strong>{{ stats.recipients }}</strong>
        </div>
        <div class="viz-summary__card">
          <span class="viz-summary__label">Leídos</span>
          <strong>{{ stats.read }}</strong>
        </div>
        <div class="viz-summary__card">
          <span class="viz-summary__label">Pendientes</span>
          <strong>{{ stats.pending }}</strong>
        </div>
        <div class="viz-summary__card">
          <span class="viz-summary__label">Porcentaje</span>
          <strong>{{ stats.percent }}%</strong>
        </div>
      </div>

      <div class="viz-filter mb-3">
        <label class="viz-filter__option">
          <input v-model="filter" type="radio" value="all" @change="reload" />
          Todos
        </label>
        <label class="viz-filter__option">
          <input v-model="filter" type="radio" value="read" @change="reload" />
          Leídos
        </label>
        <label class="viz-filter__option">
          <input v-model="filter" type="radio" value="pending" @change="reload" />
          Pendientes
        </label>
      </div>

      <EmptyState
        v-if="!recipients.length"
        icon="👥"
        title="Sin destinatarios en este filtro"
        compact
      />

      <div v-else class="modern-table-shell">
        <CTable hover responsive class="mb-0">
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Aula</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Leído</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="row in recipients" :key="row.user_id || row.student_id">
              <CTableDataCell>{{ row.full_name }}</CTableDataCell>
              <CTableDataCell class="small">{{ row.grade_section || '—' }}</CTableDataCell>
              <CTableDataCell>
                <span
                  class="status-badge"
                  :class="row.is_read ? 'status-badge--publicado' : 'status-badge--borrador'"
                >
                  {{ row.is_read ? 'Leído' : 'Pendiente' }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="small">{{ row.read_at || '—' }}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const announcement = ref(null)
const recipients = ref([])
const stats = ref({ recipients: 0, read: 0, pending: 0, percent: 0 })
const filter = ref('all')

const headerTitle = computed(() =>
  announcement.value?.title ? `Visualización: ${announcement.value.title}` : 'Visualización'
)

const headerSubtitle = computed(() => {
  if (!announcement.value) return 'Lecturas del comunicado'
  const type = announcement.value.type_label || (announcement.value.is_general ? 'Institucional' : 'Aula')
  const status = announcement.value.display_status_label || announcement.value.status
  return `${type} · ${status}`
})

const reload = async () => {
  const id = Number(route.params.id)
  if (!id) {
    loadError.value = 'Comunicado no válido.'
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    const response = await OfficialAnnouncementService.getVisualization(id, filter.value)
    if (!response.data.success) {
      loadError.value = response.data.message || 'No se pudo cargar la visualización.'
      return
    }
    const data = response.data.data
    announcement.value = data.announcement
    stats.value = data.stats || { recipients: 0, read: 0, pending: 0, percent: 0 }
    recipients.value = data.recipients || []
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar la visualización.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (route.query.from === 'history') {
    router.push('/announcements/history')
    return
  }
  router.push('/announcements/publish')
}

onMounted(reload)
</script>

<style scoped>
.viz-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.viz-summary__card {
  background: var(--rp-surface, #fff);
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.viz-summary__label {
  font-size: 0.75rem;
  color: var(--rp-text-muted, #64748b);
}

.viz-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.viz-filter__option {
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
</style>

<template>
  <div class="module-page my-announcements">
    <ModulePageHeader
      icon="fas fa-bullhorn"
      title="Comunicados oficiales"
      subtitle="Comunicados generales y avisos dirigidos a su grado, vigentes hoy."
    />

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando comunicados...
    </div>

    <EmptyState
      v-else-if="!announcements.length"
      icon="📢"
      title="No hay comunicados vigentes"
      hint="Cuando haya comunicados activos en su intervalo de fechas, aparecerán aquí."
    />

    <div v-else class="inbox-list">
      <article
        v-for="item in announcements"
        :key="item.id"
        class="inbox-item"
        :class="{ 'inbox-item--unread': !item.is_read }"
        @click="openAnnouncement(item)"
      >
        <div class="inbox-item__icon">
          <i class="fas fa-bullhorn"></i>
        </div>
        <div class="inbox-item__content">
          <div class="inbox-item__title-row">
            <span class="inbox-item__title">{{ item.title }}</span>
            <span v-if="item.is_general" class="scope-badge">General</span>
            <span class="priority-badge" :class="`priority-badge--${item.priority}`">
              {{ priorityLabel(item.priority) }}
            </span>
          </div>
          <div class="inbox-item__excerpt">{{ item.excerpt }}</div>
          <div class="inbox-item__meta">
            <i class="far fa-calendar-alt me-1"></i>
            {{ formatRange(item.starts_at, item.ends_at) }}
            <span v-if="item.publisher_name"> · {{ item.publisher_name }}</span>
          </div>
        </div>
        <span v-if="!item.is_read" class="inbox-item__dot" aria-hidden="true"></span>
      </article>
    </div>

    <CModal :visible="detailVisible" @close="closeDetail" size="lg">
      <CModalHeader>
        <CModalTitle>{{ selectedItem?.title }}</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="selectedItem">
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span v-if="selectedItem.is_general" class="scope-badge">General</span>
          <span class="priority-badge" :class="`priority-badge--${selectedItem.priority}`">
            {{ priorityLabel(selectedItem.priority) }}
          </span>
          <span class="text-body-secondary small">
            {{ formatRange(selectedItem.starts_at, selectedItem.ends_at) }}
          </span>
        </div>
        <p v-if="selectedItem.publisher_name" class="text-body-secondary small mb-3">
          <i class="fas fa-user me-1"></i>Publicado por: {{ selectedItem.publisher_name }}
        </p>
        <div class="announcement-detail-body" v-html="selectedItem.body"></div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeDetail">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'

const route = useRoute()

const announcements = ref([])
const loading = ref(true)
const loadError = ref('')
const detailVisible = ref(false)
const selectedItem = ref(null)

const priorityLabels = {
  normal: 'Normal',
  importante: 'Importante',
  urgente: 'Urgente',
}

const priorityLabel = (value) => priorityLabels[value] || value

const formatRange = (start, end) => {
  if (!start && !end) return '—'
  if (start && end) return `${start} → ${end}`
  return start || end
}

const loadAnnouncements = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await OfficialAnnouncementService.listInbox()
    if (response.data.success) {
      announcements.value = response.data.data || []
    } else {
      loadError.value = response.data.message || 'No se pudieron cargar los comunicados.'
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar comunicados.'
  } finally {
    loading.value = false
  }
}

const openAnnouncement = async (item) => {
  try {
    const response = await OfficialAnnouncementService.getInboxItem(item.id)
    if (response.data.success) {
      selectedItem.value = response.data.data
      detailVisible.value = true
      item.is_read = true
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'No se pudo abrir el comunicado.'
  }
}

const closeDetail = () => {
  detailVisible.value = false
  selectedItem.value = null
}

const openFromQuery = async () => {
  const id = Number(route.query.id)
  if (!id) return

  const existing = announcements.value.find((item) => item.id === id)
  if (existing) {
    await openAnnouncement(existing)
    return
  }

  try {
    const response = await OfficialAnnouncementService.getInboxItem(id)
    if (response.data.success) {
      selectedItem.value = response.data.data
      detailVisible.value = true
    }
  } catch {
    // ignore invalid deep link
  }
}

onMounted(async () => {
  await loadAnnouncements()
  await openFromQuery()
})
</script>

<style scoped>
.scope-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--rp-surface-brand-soft);
  color: var(--rp-text-brand);
}
</style>

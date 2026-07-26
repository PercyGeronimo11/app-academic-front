<template>
  <CModal
    :visible="visible"
    size="lg"
    alignment="center"
    backdrop="static"
    @close="closeAll"
  >
    <CModalHeader>
      <CModalTitle>
        <i class="fas fa-bullhorn me-2"></i>
        Comunicados institucionales
      </CModalTitle>
    </CModalHeader>
    <CModalBody v-if="current">
      <div class="mb-2 d-flex flex-wrap gap-2 align-items-center">
        <span class="scope-badge">General</span>
        <span class="priority-badge" :class="`priority-badge--${current.priority}`">
          {{ priorityLabel(current.priority) }}
        </span>
        <span class="text-body-secondary small">
          Vigente: {{ formatRange(current.starts_at, current.ends_at) }}
        </span>
      </div>
      <h5 class="mb-3">{{ current.title }}</h5>
      <div class="announcement-detail-body" v-html="current.body"></div>
      <p v-if="items.length > 1" class="text-body-secondary small mt-3 mb-0">
        Comunicado {{ index + 1 }} de {{ items.length }}
      </p>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="closeAll">
        Cerrar
      </CButton>
      <CButton v-if="hasNext" color="primary" @click="next">
        Siguiente
      </CButton>
      <CButton v-else color="primary" @click="closeAll">
        Entendido
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import { hasValidSession } from '@/utils/session'

const SESSION_FLAG = 'announcements_general_shown'

const visible = ref(false)
const items = ref([])
const index = ref(0)

const current = computed(() => items.value[index.value] || null)
const hasNext = computed(() => index.value < items.value.length - 1)

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

const markCurrentRead = async () => {
  const item = current.value
  if (!item?.id) return
  try {
    await OfficialAnnouncementService.markInboxRead(item.id)
  } catch {
    // no bloquear la UI
  }
}

const next = async () => {
  await markCurrentRead()
  if (hasNext.value) {
    index.value += 1
  } else {
    closeAll()
  }
}

const closeAll = async () => {
  await markCurrentRead()
  visible.value = false
  sessionStorage.setItem(SESSION_FLAG, '1')
}

const loadUnread = async () => {
  if (!hasValidSession()) return
  if (sessionStorage.getItem(SESSION_FLAG) === '1') return

  try {
    const response = await OfficialAnnouncementService.listUnreadGeneral()
    const list = response.data?.success ? response.data.data || [] : []
    if (!list.length) {
      sessionStorage.setItem(SESSION_FLAG, '1')
      return
    }
    items.value = list
    index.value = 0
    visible.value = true
  } catch {
    // silencioso: no interrumpir el flujo de la app
  }
}

onMounted(loadUnread)
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

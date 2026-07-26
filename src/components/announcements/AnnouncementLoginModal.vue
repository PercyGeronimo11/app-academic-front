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
        {{ courseClassId ? 'Comunicado del docente' : 'Comunicados oficiales' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody v-if="current">
      <div class="mb-2 d-flex flex-wrap gap-2 align-items-center">
        <span class="scope-badge" :class="{ 'scope-badge--grade': !current.is_general }">
          {{ scopeLabel(current) }}
        </span>
        <span class="priority-badge" :class="`priority-badge--${current.priority}`">
          {{ priorityLabel(current.priority) }}
        </span>
        <span class="text-body-secondary small">
          Vigente: {{ formatRange(current.starts_at, current.ends_at) }}
        </span>
      </div>
      <h5 class="mb-1">{{ current.title }}</h5>
      <p v-if="current.publisher_name" class="text-body-secondary small mb-3">
        Publicado por {{ current.publisher_name }}
      </p>
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
import { computed, onMounted, ref, watch } from 'vue'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import { hasValidSession } from '@/utils/session'

const props = defineProps({
  /** Si se indica, carga comunicados del docente para ese curso (no los generales de login). */
  courseClassId: {
    type: Number,
    default: null,
  },
})

const SESSION_FLAG = 'announcements_unread_shown'

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

const scopeLabel = (item) => {
  if (item?.is_general) return 'General'
  return item?.target_labels || 'Por aula'
}

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
  if (!props.courseClassId) {
    sessionStorage.setItem(SESSION_FLAG, '1')
  }
}

const loadUnread = async () => {
  if (!hasValidSession()) return

  // Solo en login: evitar repetir el popup en la misma sesión del navegador.
  if (!props.courseClassId && sessionStorage.getItem(SESSION_FLAG) === '1') return

  try {
    const response = props.courseClassId
      ? await OfficialAnnouncementService.listUnreadForCourse(props.courseClassId)
      : await OfficialAnnouncementService.listUnreadGeneral()

    const list = response.data?.success ? response.data.data || [] : []
    // Defensa: el login nunca debe mostrar comunicados por aula.
    const filtered = props.courseClassId
      ? list
      : list.filter((item) => item.is_general)

    if (!filtered.length) {
      if (!props.courseClassId) {
        sessionStorage.setItem(SESSION_FLAG, '1')
      }
      visible.value = false
      items.value = []
      return
    }

    items.value = filtered
    index.value = 0
    visible.value = true
  } catch {
    // silencioso: no interrumpir el flujo de la app
  }
}

onMounted(loadUnread)

watch(
  () => props.courseClassId,
  (id, prev) => {
    if (id && id !== prev) {
      loadUnread()
    }
  }
)
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

.scope-badge--grade {
  background: var(--rp-warning-50);
  color: var(--rp-warning-700);
}
</style>

<template>
  <AnnouncementAvisoOverlay
    :visible="visible"
    :item="current"
    :index="index"
    :total="items.length"
    :kind-label="courseClassId ? 'Comunicado del docente' : 'Aviso oficial'"
    confirm-label="Entendido"
    @dismiss="closeAll"
    @next="next"
    @confirm="closeAll"
  />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import AnnouncementAvisoOverlay from '@/components/announcements/AnnouncementAvisoOverlay.vue'
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
    await closeAll()
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

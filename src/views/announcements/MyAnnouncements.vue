<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <h4 class="fw-bold text-primary mb-2 d-flex align-items-center">
              <i class="fas fa-bullhorn me-2"></i>
              Comunicados oficiales
            </h4>
            <p class="tls-intro-text mb-0 text-body-secondary small">
              Comunicados generales y avisos dirigidos a su grado, vigentes hoy.
            </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow v-if="loadError" class="mb-3">
      <CCol>
        <CAlert color="danger" class="mb-0">{{ loadError }}</CAlert>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell">
              <CTable responsive hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header text-center">
                  <CTableRow>
                    <CTableHeaderCell class="text-center">Título</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Alcance</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Prioridad</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Vigencia</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Publicado por</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody v-if="loading">
                  <CTableRow>
                    <CTableDataCell colspan="7" class="table-empty-cell text-center py-4 text-body-secondary">
                      <i class="fas fa-spinner fa-spin me-2" aria-hidden="true"></i>
                      Cargando comunicados...
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>

                <CTableBody v-else-if="!announcements.length">
                  <CTableRow>
                    <CTableDataCell colspan="7" class="table-empty-cell">
                      <div class="table-empty-unified">
                        <span class="table-empty-unified__icon" aria-hidden="true">📢</span>
                        <p class="table-empty-unified__title">No hay comunicados vigentes</p>
                        <p class="table-empty-unified__hint">
                          Cuando haya comunicados activos en su intervalo de fechas, aparecerán aquí.
                        </p>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>

                <CTableBody v-else>
                  <CTableRow
                    v-for="item in announcements"
                    :key="item.id"
                    :class="{ 'announcement-row--unread': !item.is_read }"
                  >
                    <CTableDataCell class="text-center">
                      <div class="d-inline-flex align-items-center gap-2 justify-content-center">
                        <img
                          v-if="item.image_url"
                          :src="item.image_url"
                          alt=""
                          class="announcement-thumb rounded border"
                        />
                        <span class="fw-semibold">{{ item.title }}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <span v-if="item.is_general" class="scope-badge">Institucional</span>
                      <span v-else class="scope-badge scope-badge--aula">Aula</span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <span class="priority-badge" :class="`priority-badge--${item.priority || 'normal'}`">
                        {{ priorityLabel(item.priority) }}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center small text-body-secondary">
                      {{ formatRange(item.starts_at, item.ends_at) }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center small">
                      {{ item.publisher_name || '—' }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <span
                        class="status-badge"
                        :class="item.is_read ? 'status-badge--borrador' : 'status-badge--publicado'"
                      >
                        {{ item.is_read ? 'Leído' : 'No leído' }}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        :aria-label="`Ver comunicado ${item.title}`"
                        @click="openAnnouncement(item)"
                      >
                        <i class="fas fa-eye" aria-hidden="true"></i>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

  <AnnouncementAvisoOverlay
    :visible="detailVisible"
    :item="selectedItem"
    :index="0"
    :total="1"
    kind-label="Aviso oficial"
    confirm-label="Cerrar"
    :show-dismiss="false"
    @confirm="closeDetail"
    @dismiss="closeDetail"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import AnnouncementAvisoOverlay from '@/components/announcements/AnnouncementAvisoOverlay.vue'

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

const priorityLabel = (value) => priorityLabels[value] || value || 'Normal'

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

.scope-badge--aula {
  background: #ffedd5;
  color: #9a3412;
}

.announcement-row--unread {
  background: var(--rp-surface-brand-soft, rgba(13, 110, 253, 0.04));
}

.announcement-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  flex-shrink: 0;
}
</style>

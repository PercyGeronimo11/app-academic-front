<template>
  <div class="module-page announcements-history">
    <ModulePageHeader
      icon="fas fa-history"
      title="Historial"
      subtitle="Comunicados finalizados (la fecha de fin ya pasó). Solo consulta y visualización."
    />

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando historial...
    </div>

    <EmptyState
      v-else-if="!items.length"
      icon="📂"
      title="Sin comunicados finalizados"
      hint="Cuando un comunicado publicado termine su vigencia, aparecerá aquí."
      compact
    />

    <div v-else class="modern-table-shell">
      <CTable hover responsive class="mb-0 align-middle">
        <CTableHead color="info">
          <CTableRow>
            <CTableHeaderCell class="text-white">Título</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Inicio</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Fin</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Tipo</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Autor</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Estado</CTableHeaderCell>
            <CTableHeaderCell class="text-white">Lectura</CTableHeaderCell>
            <CTableHeaderCell class="text-white text-center">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="item in items" :key="item.id">
            <CTableDataCell>
              <div class="d-flex align-items-center gap-2">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  alt=""
                  class="rounded border"
                  style="width: 36px; height: 36px; object-fit: cover"
                />
                <span class="fw-semibold">{{ item.title }}</span>
              </div>
            </CTableDataCell>
            <CTableDataCell class="small text-nowrap">{{ item.starts_at || '—' }}</CTableDataCell>
            <CTableDataCell class="small text-nowrap">{{ item.ends_at || '—' }}</CTableDataCell>
            <CTableDataCell class="small">{{ item.type_label || (item.is_general ? 'Institucional' : 'Aula') }}</CTableDataCell>
            <CTableDataCell class="small">{{ item.publisher_name || '—' }}</CTableDataCell>
            <CTableDataCell>
              <span class="status-badge status-badge--finalizado">
                {{ item.display_status_label || 'Finalizado' }}
              </span>
            </CTableDataCell>
            <CTableDataCell class="small">
              <template v-if="item.read_stats">
                {{ item.read_stats.read }}/{{ item.read_stats.recipients }}
                <span class="text-body-secondary">({{ item.read_stats.percent }}%)</span>
              </template>
              <span v-else class="text-body-secondary">—</span>
            </CTableDataCell>
            <CTableDataCell class="text-center text-nowrap">
              <CButton
                size="sm"
                color="success"
                class="me-1"
                title="Visualización"
                @click="goVisualization(item)"
              >
                <i class="fas fa-chart-bar"></i>
              </CButton>
              <CButton size="sm" color="info" variant="outline" title="Ver" @click="openDetail(item)">
                <i class="fas fa-eye"></i>
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <AnnouncementAvisoOverlay
      :visible="detailVisible"
      :item="selectedItem"
      :index="0"
      :total="1"
      kind-label="Comunicado finalizado"
      confirm-label="Cerrar"
      :show-dismiss="false"
      @confirm="detailVisible = false"
      @dismiss="detailVisible = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue'
import EmptyState from '@/components/academic/EmptyState.vue'
import AnnouncementAvisoOverlay from '@/components/announcements/AnnouncementAvisoOverlay.vue'
import { toastError } from '@/utils/alerts'

const router = useRouter()

const items = ref([])
const loading = ref(true)
const detailVisible = ref(false)
const selectedItem = ref(null)

const loadList = async () => {
  loading.value = true
  try {
    const response = await OfficialAnnouncementService.listPublished({ scope: 'finished' })
    if (response.data.success) items.value = response.data.data || []
    else toastError(response.data.message || 'No se pudo cargar el historial.')
  } catch (error) {
    toastError(error.response?.data?.message || 'Error al cargar el historial.')
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  try {
    const response = await OfficialAnnouncementService.getItem(item.id)
    if (response.data.success) {
      selectedItem.value = response.data.data
      detailVisible.value = true
    }
  } catch (error) {
    toastError(error.response?.data?.message || 'No se pudo cargar el detalle.')
  }
}

const goVisualization = (item) => {
  router.push({ path: `/announcements/${item.id}/visualization`, query: { from: 'history' } })
}

onMounted(loadList)
</script>

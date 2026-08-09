<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <h4 class="fw-bold text-primary mb-2 d-flex align-items-center">
              <i class="fas fa-history me-2"></i>
              Historial de comunicados
            </h4>
            <p class="tls-intro-text mb-0 text-body-secondary small">
              Comunicados finalizados (la fecha de fin ya pasó). Solo consulta y visualización.
            </p>
          </CCardBody>
        </CCard>
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
                    <CTableHeaderCell class="text-center">Inicio</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Fin</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Tipo</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Autor</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Lectura</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody v-if="loading">
                  <CTableRow>
                    <CTableDataCell colspan="8" class="table-empty-cell text-center py-4 text-body-secondary">
                      <i class="fas fa-spinner fa-spin me-2" aria-hidden="true"></i>
                      Cargando historial...
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>

                <CTableBody v-else-if="!items.length">
                  <CTableRow>
                    <CTableDataCell colspan="8" class="table-empty-cell">
                      <div class="table-empty-unified">
                        <span class="table-empty-unified__icon" aria-hidden="true">📂</span>
                        <p class="table-empty-unified__title">Sin comunicados finalizados</p>
                        <p class="table-empty-unified__hint">
                          Cuando un comunicado publicado termine su vigencia, aparecerá aquí.
                        </p>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>

                <CTableBody v-else>
                  <CTableRow v-for="item in pagedItems" :key="item.id">
                    <CTableDataCell class="text-center">
                      <div class="d-inline-flex align-items-center gap-2 justify-content-center text-start">
                        <img
                          v-if="item.image_url"
                          :src="item.image_url"
                          alt=""
                          class="announcement-thumb rounded border"
                        />
                        <span class="fw-semibold">{{ item.title }}</span>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell class="text-center small text-nowrap">
                      {{ item.starts_at || '—' }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center small text-nowrap">
                      {{ item.ends_at || '—' }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center small">
                      {{ item.type_label || (item.is_general ? 'Institucional' : 'Aula') }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center small">
                      {{ item.publisher_name || '—' }}
                    </CTableDataCell>
                    <CTableDataCell class="text-center">
                      <span class="status-badge status-badge--finalizado">
                        {{ item.display_status_label || 'Finalizado' }}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center small">
                      <template v-if="item.read_stats">
                        {{ item.read_stats.read }}/{{ item.read_stats.recipients }}
                        <span class="text-body-secondary">({{ item.read_stats.percent }}%)</span>
                      </template>
                      <span v-else class="text-body-secondary">—</span>
                    </CTableDataCell>
                    <CTableDataCell class="text-center text-nowrap">
                      <div class="d-inline-flex gap-1 justify-content-center align-items-center flex-nowrap">
                        <CButton
                          size="sm"
                          color="success"
                          title="Visualización"
                          @click="goVisualization(item)"
                        >
                          <i class="fas fa-chart-bar" aria-hidden="true"></i>
                        </CButton>
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          title="Ver"
                          :aria-label="`Ver comunicado ${item.title}`"
                          @click="openDetail(item)"
                        >
                          <i class="fas fa-eye" aria-hidden="true"></i>
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>

            <TablePagination
              v-if="!loading && items.length"
              v-model="page"
              :total="total"
              :page-size="pageSize"
              aria-label="Paginación del historial de comunicados"
            />
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
    kind-label="Comunicado finalizado"
    confirm-label="Cerrar"
    :show-dismiss="false"
    @confirm="detailVisible = false"
    @dismiss="detailVisible = false"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService'
import AnnouncementAvisoOverlay from '@/components/announcements/AnnouncementAvisoOverlay.vue'
import TablePagination from '@/components/academic/TablePagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { toastError } from '@/utils/alerts'

const router = useRouter()

const items = ref([])
const loading = ref(true)
const detailVisible = ref(false)
const selectedItem = ref(null)

const {
  page,
  pageSize,
  total,
  pagedItems,
} = useClientPagination(items, 15)

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

<style scoped>
.announcement-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  flex-shrink: 0;
}
</style>

<template>
  <div class="module-page student-assistance">
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
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AssistanceService from '@/services/AssistanceService'
import { textoEstado, colorEstado } from '@/utils/utils'
import { isDateInBimester } from '@/utils/bimester'

const route = useRoute()
const courseClassId = Number(route.params.courseClass)

const bimesters = inject('studentBimesters', ref([]))
const selectedBimesterId = inject('studentBimesterId', ref(null))
const dateFrom = inject('assistanceDateFrom', ref(''))
const dateTo = inject('assistanceDateTo', ref(''))

const loading = ref(true)
const loadError = ref('')
const allRows = ref([])
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

watch([dateFrom, dateTo, selectedBimesterId], () => {
  currentPage.value = 1
})

watch(filteredRows, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const assistRes = await AssistanceService.listAssistanceFromStudent(courseClassId)
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

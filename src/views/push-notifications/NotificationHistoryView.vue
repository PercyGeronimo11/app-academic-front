<template>
  <div>
    <NotificationHistoryFilters />

    <CRow>
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardHeader class="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-bell me-2 text-primary"></i>
              Historial de notificaciones
            </h5>
            <CBadge color="info">{{ store.pagination.total }} registros</CBadge>
          </CCardHeader>

          <CCardBody class="p-0">
            <div v-if="store.loading" class="text-center py-5">
              <CSpinner />
            </div>

            <CAlert v-else-if="store.error" color="danger" class="m-3">
              {{ store.error }}
            </CAlert>

            <div v-else-if="!store.items.length" class="text-center text-body-secondary py-5">
              No hay notificaciones para los filtros seleccionados.
            </div>

            <CTable v-else hover responsive class="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Fecha</CTableHeaderCell>
                  <CTableHeaderCell v-if="!store.scope.isStudentView">Estudiante</CTableHeaderCell>
                  <CTableHeaderCell v-if="!store.scope.isStudentView">Aula</CTableHeaderCell>
                  <CTableHeaderCell>Título</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Lectura</CTableHeaderCell>
                  <CTableHeaderCell class="text-end">Acción</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="item in store.items" :key="item.id">
                  <CTableDataCell>{{ formatDate(item.reference_date) }}</CTableDataCell>
                  <CTableDataCell v-if="!store.scope.isStudentView">{{ item.student_name }}</CTableDataCell>
                  <CTableDataCell v-if="!store.scope.isStudentView">{{ item.grade_section_label }}</CTableDataCell>
                  <CTableDataCell>{{ item.title }}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge :color="item.status === 'sent' ? 'success' : 'danger'">
                      {{ item.status === 'sent' ? 'Enviada' : 'Fallida' }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CBadge :color="item.read_at ? 'success' : 'secondary'">
                      {{ item.read_at ? 'Leída' : 'No leída' }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell class="text-end">
                    <CButton
                      size="sm"
                      color="primary"
                      variant="outline"
                      @click="openDetail(item)"
                    >
                      Ver
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>

          <CCardFooter v-if="store.pagination.last_page > 1" class="d-flex justify-content-end gap-2">
            <CButton
              color="secondary"
              variant="outline"
              :disabled="store.loading || store.pagination.current_page <= 1"
              @click="changePage(store.pagination.current_page - 1)"
            >
              Anterior
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              :disabled="store.loading || store.pagination.current_page >= store.pagination.last_page"
              @click="changePage(store.pagination.current_page + 1)"
            >
              Siguiente
            </CButton>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Swal from 'sweetalert2'

import NotificationHistoryFilters from '@/components/push-notifications/NotificationHistoryFilters.vue'
import { usePushNotificationsStore } from '@/stores/pushNotifications'
import { BRAND_COLOR } from '@/utils/brand'

const store = usePushNotificationsStore()

const formatDate = (value) => {
  if (!value) return '-'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

const changePage = async (page) => {
  await store.loadHistory(page)
}

const openDetail = async (item) => {
  if (!item.read_at) {
    await store.markAsRead(item.id)
  }

  await Swal.fire({
    title: item.title,
    html: `<div class="text-start" style="white-space: pre-line;">${item.message}</div>`,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: BRAND_COLOR,
  })
}

onMounted(async () => {
  await store.initialize()
})
</script>

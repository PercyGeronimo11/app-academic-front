<template>
  <CContainer fluid>
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardHeader class="bg-white border-bottom py-3">
            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-file-signature me-2"></i>
              Justificar faltas (FI → FJ)
            </h5>
            <div class="text-secondary small mt-1">
              Solo faltas injustificadas de hoy o ayer (Dirección: cualquier fecha). Motivo obligatorio.
            </div>
          </CCardHeader>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody>
            <CRow class="g-2 align-items-end">
              <CCol xs="12" md="4">
                <label class="form-label fw-semibold">Fecha</label>
                <CFormInput type="date" v-model="selectedDate" />
              </CCol>
              <CCol xs="12" md="4" class="d-flex gap-2">
                <CButton color="primary" @click="fetchList">Buscar</CButton>
                <CButton color="secondary" variant="outline" @click="setTodayAndFetch">Hoy</CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow>
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell assist-table-tight">
              <CTable hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header">
                  <CTableRow>
                    <CTableHeaderCell>Apellidos y nombres</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Grado</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <template v-if="loading">
                    <CTableRow>
                      <CTableDataCell colspan="4" class="list-empty-message py-4">Cargando…</CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else-if="!items.length">
                    <CTableRow>
                      <CTableDataCell colspan="4" class="list-empty-message py-4">
                        No hay faltas injustificadas para esta fecha.
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                  <template v-else>
                    <CTableRow v-for="item in items" :key="item.assistance_id">
                      <CTableDataCell class="text-start">
                        <strong>{{ item.apellidos }}</strong>, {{ item.nombres }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        {{ item.grade }}° {{ item.section }}
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <CBadge :class="colorEstado(item.estado)" class="assist-badge-sm">
                          {{ textoEstado(item.estado) }}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell class="text-center">
                        <CButton color="warning" size="sm" @click="openModal(item)">
                          Justificar
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CModal :visible="modalVisible" @close="closeModal" alignment="center">
      <CModalHeader>
        <CModalTitle>Justificar falta</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="selected" class="mb-3">
          <div><strong>{{ selected.apellidos }}</strong>, {{ selected.nombres }}</div>
          <div class="text-secondary small">{{ selected.grade }}° {{ selected.section }} · {{ selectedDate }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Motivo <span class="text-danger">*</span></label>
          <CFormTextarea v-model="reason" rows="3" placeholder="Describa el motivo de la justificación" />
        </div>
        <div>
          <label class="form-label fw-semibold">N° de trámite (opcional)</label>
          <CFormInput v-model="requestReference" placeholder="Ej. TR-2026-001" />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="closeModal">Cancelar</CButton>
        <CButton color="primary" :disabled="saving || !reason.trim()" @click="submitJustify">
          {{ saving ? 'Guardando…' : 'Guardar justificación' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </CContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { textoEstado, colorEstado } from '@/utils/utils'
import { toastError, toastSuccess } from '@/utils/alerts'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormInput,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/vue'

const items = ref([])
const loading = ref(false)
const selectedDate = ref('')
const modalVisible = ref(false)
const selected = ref(null)
const reason = ref('')
const requestReference = ref('')
const saving = ref(false)

const todayIso = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await AssistanceService.listUnjustifiedAbsences({ date: selectedDate.value })
    items.value = res.data.results || []
  } catch (error) {
    items.value = []
    toastError(error.response?.data?.mensaje || 'No se pudo cargar la lista')
  } finally {
    loading.value = false
  }
}

const setTodayAndFetch = () => {
  selectedDate.value = todayIso()
  fetchList()
}

const openModal = (item) => {
  selected.value = item
  reason.value = ''
  requestReference.value = ''
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  selected.value = null
}

const submitJustify = async () => {
  if (!selected.value || !reason.value.trim()) return
  saving.value = true
  try {
    await AssistanceService.justifyAbsence({
      assistance_id: selected.value.assistance_id,
      reason: reason.value.trim(),
      request_reference: requestReference.value.trim() || undefined,
    })
    toastSuccess('Falta justificada correctamente')
    closeModal()
    fetchList()
  } catch (error) {
    toastError(error.response?.data?.mensaje || 'No se pudo justificar')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  selectedDate.value = todayIso()
  fetchList()
})
</script>

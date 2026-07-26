<template>
  <div class="settings-page">
    <CardComponent title="Configuraciones generales" style="margin: 20px 10px;">
      <p class="settings-intro text-body-secondary mb-4">
        Gestione los periodos escolares y sus 4 bimestres (inicio y fin).
      </p>

      <!-- Periodos escolares -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Periodos escolares</h5>
        <CButton color="info" class="text-white" @click="openCreatePeriod">Nuevo periodo</CButton>
      </div>

      <ElegantCrudList :columns="periodColumns" :data="periods">
        <template #status="{ item }">
          <span :class="['status-pill', item.status ? 'status-active' : 'status-inactive']">
            {{ item.status ? 'Activo' : 'Inactivo' }}
          </span>
        </template>
        <template #actions="{ item }">
          <CButton color="warning" class="text-white me-1" @click="openEditPeriod(item)">
            <CIcon :content="cilPencil" size="lg" />
          </CButton>
          <CButton color="danger" class="text-white" @click="deletePeriod(item)">
            <CIcon :content="cilTrash" size="lg" />
          </CButton>
        </template>
      </ElegantCrudList>

      <hr class="my-4" />

      <!-- Bimestres -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h5 class="mb-0">Bimestres del año escolar</h5>
        <div class="d-flex align-items-center gap-2">
          <label class="mb-0 text-body-secondary">Periodo:</label>
          <select v-model="selectedYear" class="form-select form-select-sm year-select" @change="loadBimesters">
            <option v-for="p in periods" :key="p.id" :value="p.year">
              {{ p.name }} {{ p.status ? '(activo)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="!periods.length" class="text-body-secondary">
        Primero registre un periodo escolar para gestionar sus bimestres.
      </p>

      <ElegantCrudList
        v-else
        :columns="bimesterColumns"
        :data="bimesters"
        empty-message="No hay bimestres para este año. Edite el periodo para generarlos."
      >
        <template #actions="{ item }">
          <CButton color="warning" class="text-white" @click="openEditBimester(item)">
            <CIcon :content="cilPencil" size="lg" />
          </CButton>
        </template>
      </ElegantCrudList>
    </CardComponent>

    <!-- Modal periodo -->
    <CModal :visible="periodModalOpen" alignment="center" size="lg" @close="closePeriodModal">
      <CModalHeader>
        <CModalTitle>{{ periodEditMode ? 'Editar periodo escolar' : 'Nuevo periodo escolar' }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitPeriod">
          <CRow class="mb-3">
            <CCol md="4">
              <CFormInput
                v-model="periodForm.name"
                label="Año / nombre"
                placeholder="Ej. 2026"
                required
                maxlength="10"
              />
              <small class="text-body-secondary">Debe incluir el año (4 dígitos).</small>
            </CCol>
            <CCol md="4">
              <CFormInput v-model="periodForm.start_time" type="date" label="Fecha de inicio" required />
            </CCol>
            <CCol md="4">
              <CFormInput v-model="periodForm.end_time" type="date" label="Fecha de fin" required />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <div class="form-check form-switch">
                <input
                  id="period-status"
                  v-model="periodForm.status"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="period-status">
                  Periodo activo (desactiva los demás)
                </label>
              </div>
            </CCol>
          </CRow>
          <p v-if="!periodEditMode" class="mt-3 mb-0 text-body-secondary small">
            Al crear el periodo se generan automáticamente los 4 bimestres del año escolar.
          </p>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closePeriodModal">Cancelar</CButton>
        <CButton color="primary" @click="submitPeriod">
          {{ periodEditMode ? 'Actualizar' : 'Registrar' }}
        </CButton>
      </CModalFooter>
    </CModal>

    <!-- Modal bimestre -->
    <CModal :visible="bimesterModalOpen" alignment="center" @close="closeBimesterModal">
      <CModalHeader>
        <CModalTitle>Editar bimestre</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitBimester">
          <CRow class="mb-3">
            <CCol>
              <CFormInput :model-value="`Bimestre ${bimesterForm.number}`" label="Número" disabled />
            </CCol>
          </CRow>
          <CRow class="mb-3">
            <CCol>
              <CFormInput v-model="bimesterForm.name" label="Nombre" required maxlength="40" />
            </CCol>
          </CRow>
          <CRow>
            <CCol md="6">
              <CFormInput v-model="bimesterForm.start_date" type="date" label="Fecha de inicio" required />
            </CCol>
            <CCol md="6">
              <CFormInput v-model="bimesterForm.end_date" type="date" label="Fecha de fin" required />
            </CCol>
          </CRow>
          <p class="mt-3 mb-0 text-body-secondary small">
            Las fechas deben estar dentro del periodo escolar y no solaparse con otros bimestres.
          </p>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeBimesterModal">Cancelar</CButton>
        <CButton color="primary" @click="submitBimester">Actualizar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { cilPencil, cilTrash } from '@coreui/icons'
import CardComponent from '@/components/cruds/CardComponent.vue'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import PeriodService from '@/services/PeriodService'
import BimesterService from '@/services/BimesterService'

const periods = ref([])
const bimesters = ref([])
const selectedYear = ref(null)

const periodModalOpen = ref(false)
const periodEditMode = ref(false)
const periodForm = ref({
  id: null,
  name: '',
  start_time: '',
  end_time: '',
  status: true,
})

const bimesterModalOpen = ref(false)
const bimesterForm = ref({
  id: null,
  number: '',
  name: '',
  start_date: '',
  end_date: '',
})

const periodColumns = [
  { key: 'name', label: 'Periodo' },
  { key: 'start_time', label: 'Inicio' },
  { key: 'end_time', label: 'Fin' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Opciones' },
]

const bimesterColumns = [
  { key: 'number', label: 'N°' },
  { key: 'name', label: 'Nombre' },
  { key: 'start_date', label: 'Inicio' },
  { key: 'end_date', label: 'Fin' },
  { key: 'actions', label: 'Opciones' },
]

const formatDate = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const loadPeriods = async () => {
  const response = await PeriodService.getItems()
  const list = response.data?.data || []
  periods.value = list.map((p) => ({
    ...p,
    start_time: formatDate(p.start_time),
    end_time: formatDate(p.end_time),
  }))

  if (!selectedYear.value && periods.value.length) {
    const active = periods.value.find((p) => p.status) || periods.value[0]
    selectedYear.value = active.year
  }

  if (selectedYear.value) {
    await loadBimesters()
  } else {
    bimesters.value = []
  }
}

const loadBimesters = async () => {
  if (!selectedYear.value) {
    bimesters.value = []
    return
  }
  const response = await BimesterService.list(selectedYear.value)
  const list = response.data?.data || []
  bimesters.value = list.map((b) => ({
    ...b,
    start_date: formatDate(b.start_date),
    end_date: formatDate(b.end_date),
  }))
}

const openCreatePeriod = () => {
  periodEditMode.value = false
  periodForm.value = {
    id: null,
    name: String(new Date().getFullYear()),
    start_time: `${new Date().getFullYear()}-03-01`,
    end_time: `${new Date().getFullYear()}-12-15`,
    status: true,
  }
  periodModalOpen.value = true
}

const openEditPeriod = (item) => {
  periodEditMode.value = true
  periodForm.value = {
    id: item.id,
    name: item.name,
    start_time: formatDate(item.start_time),
    end_time: formatDate(item.end_time),
    status: !!item.status,
  }
  periodModalOpen.value = true
}

const closePeriodModal = () => {
  periodModalOpen.value = false
}

const submitPeriod = async () => {
  try {
    const payload = { ...periodForm.value }
    if (periodEditMode.value) {
      await PeriodService.updateItem(payload)
    } else {
      await PeriodService.createItem(payload)
    }
    closePeriodModal()
    await loadPeriods()
    Swal.fire({
      icon: 'success',
      title: periodEditMode.value ? 'Periodo actualizado' : 'Periodo registrado',
      text: periodEditMode.value
        ? 'Los datos del periodo se guardaron correctamente.'
        : 'Se creó el periodo y sus 4 bimestres.',
    })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'No se pudo guardar el periodo.'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: typeof message === 'string' ? message : 'Error al guardar',
    })
  }
}

const deletePeriod = async (item) => {
  const confirmResult = await Swal.fire({
    icon: 'question',
    iconColor: '#E55353',
    title: 'Eliminar periodo',
    text: `¿Eliminar el periodo ${item.name} y sus bimestres? Solo es posible si no tiene aulas asignadas.`,
    confirmButtonText: 'Eliminar',
    confirmButtonColor: '#E55353',
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  })

  if (!confirmResult.isConfirmed) return

  try {
    await PeriodService.deleteItem(item.id)
    if (selectedYear.value === item.year) {
      selectedYear.value = null
    }
    await loadPeriods()
    Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      text: 'Periodo escolar eliminado.',
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo eliminar',
      text: error.response?.data?.message || 'Error al eliminar el periodo.',
    })
  }
}

const openEditBimester = (item) => {
  bimesterForm.value = {
    id: item.id,
    number: item.number,
    name: item.name,
    start_date: formatDate(item.start_date),
    end_date: formatDate(item.end_date),
  }
  bimesterModalOpen.value = true
}

const closeBimesterModal = () => {
  bimesterModalOpen.value = false
}

const submitBimester = async () => {
  try {
    await BimesterService.updateItem({
      id: bimesterForm.value.id,
      name: bimesterForm.value.name,
      start_date: bimesterForm.value.start_date,
      end_date: bimesterForm.value.end_date,
    })
    closeBimesterModal()
    await loadBimesters()
    Swal.fire({
      icon: 'success',
      title: 'Bimestre actualizado',
      text: 'Las fechas del bimestre se guardaron correctamente.',
    })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'No se pudo actualizar el bimestre.'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: typeof message === 'string' ? message : 'Error al guardar',
    })
  }
}

watch(selectedYear, () => {
  loadBimesters()
})

onMounted(async () => {
  try {
    await loadPeriods()
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar las configuraciones.',
    })
  }
})
</script>

<style scoped>
.settings-page {
  padding-bottom: var(--rp-space-4);
}

.settings-intro {
  font-size: var(--rp-text-base);
}

.year-select {
  min-width: 9rem;
  max-width: 100%;
}

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: var(--rp-success-100);
  color: var(--rp-success-800);
}

.status-inactive {
  background: var(--rp-danger-100);
  color: var(--rp-danger-800);
}
</style>

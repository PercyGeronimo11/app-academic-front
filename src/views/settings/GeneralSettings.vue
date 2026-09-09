<template>
  <CContainer fluid class="px-2 px-md-3 settings-page">
    <!-- Cabecera -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="settings-page__intro mb-3">
              <div class="settings-page__intro-text">
                <h4 class="settings-page__title mb-1">
                  <i class="fas fa-cog" aria-hidden="true"></i>
                  Configuración académica
                </h4>
                <p class="settings-page__subtitle mb-0">
                  {{ activeIntro }}
                </p>
              </div>
            </div>

            <nav class="settings-tabs" aria-label="Secciones de configuración">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="settings-tabs__item"
                :class="{ 'is-active': activeTab === tab.id }"
                @click="setTab(tab.id)"
              >
                <i :class="tab.icon" aria-hidden="true"></i>
                <span>{{ tab.label }}</span>
              </button>
            </nav>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Contenido -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody :class="contentBodyClass">
            <!-- Periodo escolar -->
            <div v-show="activeTab === 'periodos'">
              <div class="settings-page__section-bar">
                <h5 class="settings-page__section-title mb-0">Periodos escolares</h5>
                <CButton color="primary" class="settings-page__new" @click="openCreatePeriod">
                  <i class="fas fa-plus me-2" aria-hidden="true"></i>
                  Nuevo periodo
                </CButton>
              </div>
              <div class="list-with-pagination-wrap">
                <ElegantCrudList :columns="periodColumns" :data="periods">
                  <template #status="{ item }">
                    <span :class="['status-pill', item.status ? 'status-active' : 'status-inactive']">
                      {{ item.status ? 'Activo' : 'Inactivo' }}
                    </span>
                  </template>
                  <template #actions="{ item }">
                    <div class="settings-actions">
                      <CButton
                        color="warning"
                        size="sm"
                        class="text-white settings-actions__btn"
                        title="Editar"
                        @click.stop="openEditPeriod(item)"
                      >
                        <CIcon :content="cilPencil" />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        class="text-white settings-actions__btn"
                        title="Eliminar"
                        @click.stop="deletePeriod(item)"
                      >
                        <CIcon :content="cilTrash" />
                      </CButton>
                    </div>
                  </template>
                </ElegantCrudList>
              </div>
            </div>

            <!-- Cursos -->
            <div v-if="activeTab === 'cursos'" class="settings-page__flush-list">
              <CourseView embedded />
            </div>

            <!-- Asignación de docentes por aula -->
            <div v-if="activeTab === 'asignacion'" class="settings-page__flush-list">
              <ClassroomAssignmentPanel />
            </div>

            <!-- Horarios (solo lectura) -->
            <div v-if="activeTab === 'horarios'" class="settings-page__flush-list">
              <SchedulesSettingsPanel />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Modal periodo -->
    <CModal
      :visible="periodModalOpen"
      alignment="center"
      size="lg"
      scrollable
      aria-labelledby="period-modal-title"
      @close="closePeriodModal"
    >
      <CModalHeader class="bg-primary text-white border-0">
        <CModalTitle id="period-modal-title">
          {{ periodEditMode ? 'Editar periodo escolar' : 'Nuevo periodo escolar' }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="submitPeriod">
          <CRow class="g-2 g-md-3 mb-3 align-items-end">
            <CCol xs="6" md="4">
              <CFormInput
                v-model="periodForm.name"
                label="Año / nombre"
                placeholder="Ej. 2026"
                required
                maxlength="10"
              />
              <small class="text-body-secondary d-none d-md-block">Debe incluir el año (4 dígitos).</small>
            </CCol>
            <CCol xs="6" md="8" class="period-status-col">
              <div class="form-check form-switch period-status-switch mb-0">
                <input
                  id="period-status"
                  v-model="periodForm.status"
                  class="form-check-input"
                  type="checkbox"
                />
                <label class="form-check-label" for="period-status">
                  Periodo activo
                  <span class="d-none d-sm-inline"> (desactiva los demás)</span>
                </label>
              </div>
            </CCol>
          </CRow>
          <CRow class="g-2 g-md-3 mb-3">
            <CCol xs="6">
              <CFormInput
                v-model="periodForm.start_time"
                type="text"
                inputmode="numeric"
                placeholder="dd/mm/aaaa"
                label="Fecha de inicio"
                required
              />
            </CCol>
            <CCol xs="6">
              <CFormInput
                v-model="periodForm.end_time"
                type="text"
                inputmode="numeric"
                placeholder="dd/mm/aaaa"
                label="Fecha de fin"
                required
              />
            </CCol>
          </CRow>
          <small class="text-body-secondary d-block d-md-none mb-3">
            El nombre debe incluir el año (4 dígitos).
          </small>

          <div class="period-bimesters-head">
            <h6 class="period-bimesters-title mb-0">Bimestres del periodo</h6>
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              type="button"
              @click="redistributeBimesters"
            >
              Distribuir en 4 partes
            </CButton>
          </div>
          <p class="text-body-secondary small mb-3">
            Defina inicio y fin de cada bimestre. Deben estar dentro del periodo y no solaparse.
          </p>
          <div
            v-for="(bim, idx) in periodBimestersForm"
            :key="bim.number"
            class="period-bimester-card mb-3"
          >
            <div class="period-bimester-card__label">{{ bim.name }}</div>
            <CRow class="g-2">
              <CCol xs="6">
                <CFormInput
                  v-model="periodBimestersForm[idx].start_date"
                  type="text"
                  inputmode="numeric"
                  placeholder="dd/mm/aaaa"
                  label="Inicio"
                  required
                />
              </CCol>
              <CCol xs="6">
                <CFormInput
                  v-model="periodBimestersForm[idx].end_date"
                  type="text"
                  inputmode="numeric"
                  placeholder="dd/mm/aaaa"
                  label="Fin"
                  required
                />
              </CCol>
            </CRow>
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closePeriodModal">Cancelar</CButton>
        <CButton color="primary" @click="submitPeriod">
          {{ periodEditMode ? 'Actualizar' : 'Registrar' }}
        </CButton>
      </CModalFooter>
    </CModal>
  </CContainer>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { cilPencil, cilTrash } from '@coreui/icons'
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue'
import CourseView from '@/views/course/Course.vue'
import ClassroomAssignmentPanel from '@/views/settings/ClassroomAssignmentPanel.vue'
import SchedulesSettingsPanel from '@/views/settings/SchedulesSettingsPanel.vue'
import PeriodService from '@/services/PeriodService'
import { formatDate, toIsoDate } from '@/utils/time'

const VALID_TABS = ['periodos', 'cursos', 'asignacion', 'horarios']

const tabs = [
  { id: 'periodos', label: 'Periodo escolar', icon: 'fas fa-calendar-alt' },
  { id: 'cursos', label: 'Cursos', icon: 'fas fa-book' },
  { id: 'asignacion', label: 'Asignación', icon: 'fas fa-chalkboard-teacher' },
  { id: 'horarios', label: 'Horarios', icon: 'fas fa-clock' },
]

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  const tab = String(route.query.tab || '')
  return VALID_TABS.includes(tab) ? tab : 'periodos'
})

const contentBodyClass = computed(() => {
  return 'p-0'
})

const activeIntro = computed(() => {
  if (activeTab.value === 'cursos') {
    return 'Consulte y actualice el catálogo de cursos del colegio.'
  }
  if (activeTab.value === 'horarios') {
    return 'Consulte los horarios registrados desde Asignación para el periodo académico activo.'
  }
  if (activeTab.value === 'asignacion') {
    return 'Asigne un docente a cada curso del aula en el periodo académico activo.'
  }
  return 'Gestione los periodos escolares y sus 4 bimestres desde el mismo formulario (nuevo o editar).'
})

const setTab = (tab) => {
  if (tab === activeTab.value && route.query.tab === tab) return
  router.replace({ path: '/settings', query: { tab } })
}

const ensureTabQuery = () => {
  if (!VALID_TABS.includes(String(route.query.tab || ''))) {
    router.replace({ path: '/settings', query: { tab: 'periodos' } })
  }
}

const periods = ref([])

const periodModalOpen = ref(false)
const periodEditMode = ref(false)
const periodForm = ref({
  id: null,
  name: '',
  start_time: '',
  end_time: '',
  status: true,
})

const BIMESTER_NAMES = {
  1: 'Primer Bimestre',
  2: 'Segundo Bimestre',
  3: 'Tercer Bimestre',
  4: 'Cuarto Bimestre',
}

const emptyPeriodBimesters = () => ([
  { number: 1, name: BIMESTER_NAMES[1], start_date: '', end_date: '' },
  { number: 2, name: BIMESTER_NAMES[2], start_date: '', end_date: '' },
  { number: 3, name: BIMESTER_NAMES[3], start_date: '', end_date: '' },
  { number: 4, name: BIMESTER_NAMES[4], start_date: '', end_date: '' },
])

const periodBimestersForm = ref(emptyPeriodBimesters())

const periodColumns = [
  { key: 'name', label: 'Periodo' },
  { key: 'start_time', label: 'Inicio' },
  { key: 'end_time', label: 'Fin' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Opciones', center: true },
]

const displayDate = (value) => {
  const formatted = formatDate(value)
  return formatted === '-' ? '' : formatted
}

const assertDisplayDate = (value, label) => {
  const iso = toIsoDate(value)
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new Error(`${label} debe tener el formato dd/mm/aaaa.`)
  }
  return iso
}

/** Parte el rango del periodo en 4 tramos (misma lógica que el backend). */
const splitIntoFourRanges = (startIso, endIso) => {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return emptyPeriodBimesters()
  }

  const msDay = 24 * 60 * 60 * 1000
  const totalDays = Math.floor((end - start) / msDay) + 1
  const chunk = Math.max(1, Math.floor(totalDays / 4))
  const ranges = []
  let cursor = new Date(start)

  const toIso = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  for (let i = 1; i <= 4; i += 1) {
    const rangeStart = new Date(cursor)
    let rangeEnd
    if (i === 4) {
      rangeEnd = new Date(end)
    } else {
      rangeEnd = new Date(cursor.getTime() + (chunk - 1) * msDay)
      if (rangeEnd > end) rangeEnd = new Date(end)
    }
    ranges.push({
      number: i,
      name: BIMESTER_NAMES[i],
      start_date: displayDate(toIso(rangeStart)),
      end_date: displayDate(toIso(rangeEnd)),
    })
    cursor = new Date(rangeEnd.getTime() + msDay)
    if (cursor > end) cursor = new Date(end)
  }

  return ranges
}

const redistributeBimesters = () => {
  try {
    const startIso = assertDisplayDate(periodForm.value.start_time, 'La fecha de inicio del periodo')
    const endIso = assertDisplayDate(periodForm.value.end_time, 'La fecha de fin del periodo')
    periodBimestersForm.value = splitIntoFourRanges(startIso, endIso)
  } catch (error) {
    Swal.fire({
      icon: 'warning',
      title: 'Fechas del periodo',
      text: error.message || 'Indique primero inicio y fin del periodo.',
    })
  }
}

const loadPeriods = async () => {
  const response = await PeriodService.getItems()
  const list = response.data?.data || []
  periods.value = list.map((p) => ({
    ...p,
    start_time: displayDate(p.start_time),
    end_time: displayDate(p.end_time),
  }))
}

const mapLoadedBimesters = (list) => {
  const byNumber = {}
  ;(list || []).forEach((b) => {
    byNumber[Number(b.number)] = b
  })
  return [1, 2, 3, 4].map((number) => {
    const row = byNumber[number]
    return {
      number,
      name: row?.name || BIMESTER_NAMES[number],
      start_date: displayDate(row?.start_date),
      end_date: displayDate(row?.end_date),
    }
  })
}

const openCreatePeriod = () => {
  periodEditMode.value = false
  const year = new Date().getFullYear()
  const startIso = `${year}-03-01`
  const endIso = `${year}-12-15`
  periodForm.value = {
    id: null,
    name: String(year),
    start_time: displayDate(startIso),
    end_time: displayDate(endIso),
    status: true,
  }
  periodBimestersForm.value = splitIntoFourRanges(startIso, endIso)
  periodModalOpen.value = true
}

const openEditPeriod = async (item) => {
  periodEditMode.value = true
  periodForm.value = {
    id: item.id,
    name: item.name,
    start_time: displayDate(item.start_time),
    end_time: displayDate(item.end_time),
    status: !!item.status,
  }
  periodBimestersForm.value = emptyPeriodBimesters()
  periodModalOpen.value = true

  try {
    const response = await PeriodService.getItem(item.id)
    const data = response.data?.data || {}
    periodForm.value = {
      id: data.id ?? item.id,
      name: data.name ?? item.name,
      start_time: displayDate(data.start_time ?? item.start_time),
      end_time: displayDate(data.end_time ?? item.end_time),
      status: data.status !== undefined ? !!data.status : !!item.status,
    }
    const loaded = mapLoadedBimesters(data.bimesters)
    const hasDates = loaded.some((b) => b.start_date && b.end_date)
    if (hasDates) {
      periodBimestersForm.value = loaded
    } else {
      const startIso = assertDisplayDate(periodForm.value.start_time, 'La fecha de inicio')
      const endIso = assertDisplayDate(periodForm.value.end_time, 'La fecha de fin')
      periodBimestersForm.value = splitIntoFourRanges(startIso, endIso)
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'warning',
      title: 'Bimestres',
      text: 'No se pudieron cargar los bimestres. Puede redistribuirlos o completarlos manualmente.',
    })
  }
}

const closePeriodModal = () => {
  periodModalOpen.value = false
}

const buildBimestersPayload = () => periodBimestersForm.value.map((bim) => ({
  number: bim.number,
  name: bim.name,
  start_date: assertDisplayDate(bim.start_date, `Inicio del bimestre ${bim.number}`),
  end_date: assertDisplayDate(bim.end_date, `Fin del bimestre ${bim.number}`),
}))

const submitPeriod = async () => {
  try {
    const payload = {
      ...periodForm.value,
      start_time: assertDisplayDate(periodForm.value.start_time, 'La fecha de inicio'),
      end_time: assertDisplayDate(periodForm.value.end_time, 'La fecha de fin'),
      bimesters: buildBimestersPayload(),
    }

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
        ? 'Periodo y bimestres guardados correctamente.'
        : 'Se creó el periodo y sus 4 bimestres.',
    })
  } catch (error) {
    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      error.message ||
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

watch(
  () => route.query.tab,
  () => {
    ensureTabQuery()
  },
)

onMounted(async () => {
  ensureTabQuery()
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

.settings-page__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
}

.settings-page__title {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  margin: 0;
  font-weight: var(--rp-weight-bold);
  color: var(--rp-brand-500);
  font-size: var(--rp-text-lg);
  line-height: var(--rp-leading-tight);
}

.settings-page__subtitle {
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
  max-width: 42rem;
}

.settings-page__section-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-2);
  padding: var(--rp-space-3) var(--rp-space-3);
  border-bottom: 1px solid var(--rp-border-subtle);
}

.settings-page__section-title {
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.settings-page__new {
  min-height: 44px;
}

.settings-page__flush-list :deep(.modern-list-wrapper) {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.list-with-pagination-wrap :deep(.modern-list-wrapper) {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.settings-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted);
  border: 1px solid var(--rp-border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.settings-tabs__item {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--rp-text-secondary, #64748b);
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.55rem 0.85rem;
  border-radius: calc(var(--rp-radius-md) - 2px);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  min-height: 44px;
  flex: 1 1 auto;
  justify-content: center;
}

.settings-tabs__item i {
  font-size: 0.9rem;
  opacity: 0.9;
}

.settings-tabs__item:hover {
  color: var(--rp-text-heading, #0f172a);
  background: color-mix(in srgb, var(--rp-surface) 70%, transparent);
}

.settings-tabs__item.is-active {
  color: var(--rp-brand-500);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
}

.settings-actions {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: var(--rp-space-1);
}

.settings-actions__btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
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

.period-bimesters-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-2);
  margin-bottom: var(--rp-space-2);
  padding-top: var(--rp-space-2);
  border-top: 1px solid var(--rp-border-subtle);
}

.period-bimesters-title {
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-brand-600);
}

.period-bimester-card {
  padding: var(--rp-space-3);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted, var(--rp-surface-sunken));
}

.period-bimester-card__label {
  margin-bottom: var(--rp-space-2);
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.period-status-col {
  display: flex;
  align-items: flex-end;
  min-height: 2.5rem;
  padding-bottom: 0.15rem;
}

.period-status-switch {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
}

.period-status-switch .form-check-label {
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-snug);
}

@media (min-width: 768px) {
  .settings-page__title {
    font-size: var(--rp-text-xl);
  }

  .settings-page__section-bar {
    padding: var(--rp-space-3) var(--rp-space-4);
  }

  .settings-tabs__item {
    flex: 0 1 auto;
    padding: 0.55rem 1rem;
    font-size: 0.92rem;
  }

  .settings-actions {
    gap: var(--rp-space-2);
  }

  .settings-actions__btn {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>

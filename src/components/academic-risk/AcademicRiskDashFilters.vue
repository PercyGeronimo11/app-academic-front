<template>
  <CCard class="shadow-sm border-0 mb-3 academic-risk-filters risk-dash-filters">
    <CCardBody class="p-3 p-md-4">
      <div class="academic-risk-filters__row">
        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Año escolar</CFormLabel>
          <CFormSelect
            :model-value="store.filters.schoolYear"
            :disabled="store.loading || store.updating"
            @change="onYear"
          >
            <option v-for="year in store.schoolYears" :key="year" :value="year">{{ year }}</option>
          </CFormSelect>
        </div>

        <div class="academic-risk-filters__field">
          <CFormLabel class="academic-risk-filters__label">Bimestre</CFormLabel>
          <CFormSelect
            :model-value="store.filters.bimester"
            :disabled="store.loading || store.updating || !store.bimesters.length"
            @change="onBimester"
          >
            <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
              {{ item.name }}
            </option>
          </CFormSelect>
        </div>

        <div
          v-if="!store.scope.isStudentView"
          class="academic-risk-filters__field academic-risk-filters__field--aula"
        >
          <CFormLabel class="academic-risk-filters__label">Aula</CFormLabel>
          <div class="aula-combobox" ref="comboRoot">
            <CFormInput
              v-model="aulaSearch"
              type="search"
              placeholder="Buscar grado / sección..."
              autocomplete="off"
              :disabled="store.loading || store.updating"
              @focus="openAulaMenu"
              @input="openAulaMenu"
              @keydown.down.prevent="moveAulaHighlight(1)"
              @keydown.up.prevent="moveAulaHighlight(-1)"
              @keydown.enter.prevent="selectHighlightedAula"
              @keydown.esc="closeAulaMenu"
            />
            <ul v-if="aulaMenuOpen" class="aula-combobox__menu">
              <li
                :class="{ 'is-active': highlightedIndex === 0, 'is-selected': store.filters.gradeSectionId == null }"
                @mousedown.prevent="selectAula(null)"
              >
                Todas
              </li>
              <li
                v-for="(item, index) in filteredAulas"
                :key="item.id"
                :class="{
                  'is-active': highlightedIndex === index + 1,
                  'is-selected': store.filters.gradeSectionId === item.id,
                }"
                @mousedown.prevent="selectAula(item.id)"
              >
                {{ item.label }}
              </li>
              <li v-if="!filteredAulas.length" class="aula-combobox__empty">
                Sin coincidencias
              </li>
            </ul>
          </div>
        </div>

        <div class="academic-risk-filters__actions">
          <CButton
            color="secondary"
            variant="outline"
            :disabled="store.loading || store.updating || !store.canQuery"
            @click="$emit('apply')"
          >
            <i class="fas fa-search me-2"></i>
            Consultar
          </CButton>
          <CButton
            v-if="store.canUpdatePredictions"
            color="primary"
            :disabled="!store.canUpdatePredictions || store.updating"
            @click="$emit('update-predictions')"
          >
            <i class="fas fa-sync-alt me-2"></i>
            Actualizar Predicciones
          </CButton>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAcademicRiskDashboardStore } from '@/stores/academicRiskDashboard'

defineEmits(['apply', 'update-predictions'])

const store = useAcademicRiskDashboardStore()

const aulaSearch = ref('Todas')
const aulaMenuOpen = ref(false)
const highlightedIndex = ref(0)
const comboRoot = ref(null)

const filteredAulas = computed(() => {
  const query = aulaSearch.value.trim().toLowerCase()
  if (!query || query === 'todas') return store.gradeSections
  return store.gradeSections.filter((item) => item.label.toLowerCase().includes(query))
})

const syncAulaLabel = () => {
  if (store.filters.gradeSectionId == null) {
    aulaSearch.value = 'Todas'
    return
  }
  const selected = store.gradeSections.find((item) => item.id === store.filters.gradeSectionId)
  aulaSearch.value = selected?.label || 'Todas'
}

watch(
  () => [store.filters.gradeSectionId, store.gradeSections],
  () => syncAulaLabel(),
  { deep: true },
)

const openAulaMenu = () => {
  aulaMenuOpen.value = true
  highlightedIndex.value = 0
  aulaSearch.value = ''
}

const closeAulaMenu = () => {
  aulaMenuOpen.value = false
  syncAulaLabel()
}

const selectAula = (id) => {
  store.onGradeSectionChange(id)
  syncAulaLabel()
  aulaMenuOpen.value = false
}

const moveAulaHighlight = (delta) => {
  if (!aulaMenuOpen.value) openAulaMenu()
  const max = filteredAulas.value.length
  const next = highlightedIndex.value + delta
  if (next < 0) {
    highlightedIndex.value = max
  } else if (next > max) {
    highlightedIndex.value = 0
  } else {
    highlightedIndex.value = next
  }
}

const selectHighlightedAula = () => {
  if (!aulaMenuOpen.value) return
  if (highlightedIndex.value === 0) {
    selectAula(null)
    return
  }
  const item = filteredAulas.value[highlightedIndex.value - 1]
  if (item) selectAula(item.id)
}

const onDocumentClick = (event) => {
  if (!comboRoot.value?.contains(event.target)) {
    closeAulaMenu()
  }
}

onMounted(() => {
  syncAulaLabel()
  document.addEventListener('mousedown', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})

const onYear = async (event) => {
  await store.onSchoolYearChange(Number(event.target.value))
}

const onBimester = (event) => {
  store.onBimesterChange(Number(event.target.value))
}
</script>

<style scoped lang="scss">
.aula-combobox {
  position: relative;
}

.aula-combobox__menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 0.35rem 0;
  list-style: none;
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  box-shadow: var(--rp-shadow-md);
}

.aula-combobox__menu li {
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.aula-combobox__menu li:hover,
.aula-combobox__menu li.is-active {
  background: var(--rp-surface-hover);
}

.aula-combobox__menu li.is-selected {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-brand);
}

.aula-combobox__empty {
  color: var(--rp-text-subtle);
  cursor: default !important;
}

.academic-risk-filters__field--aula {
  min-width: 220px;
  flex: 1.2;
}
</style>

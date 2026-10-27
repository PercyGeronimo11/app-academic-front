<template>
  <div class="notes-page">
    <NotesFilterCard
      title="Orden de mérito"
      eyebrow="Notas"
      description="Ranking de promedio de notas según el bimestre y el aula consultados."
      icon-class="fas fa-medal"
      :period-year="periodYear"
      :current-bimester-label="currentBimesterLabel"
      :bimesters="bimesters"
      :classrooms="classrooms"
      :bimester="bimester"
      :grade="grade"
      :section="section"
      :loading="loading"
      :can-query="canQuery"
      @update:bimester="bimester = $event"
      @update:grade="grade = $event"
      @update:section="section = $event"
      @apply="loadRecords"
    />

    <div v-if="loading" class="text-center py-5">
      <CSpinner color="primary" />
      <p class="mt-3 mb-0 text-body-secondary">Cargando orden de mérito...</p>
    </div>

    <CAlert v-else-if="error" color="warning">{{ error }}</CAlert>

    <CCard v-else class="shadow-sm border-0">
      <CCardHeader class="bg-white border-0 pt-3 pb-0 px-3 px-md-4">
        <div class="d-flex justify-content-between align-items-center gap-2">
          <h2 class="notes-rank__title mb-0">
            <i class="fas fa-medal me-2" aria-hidden="true"></i>
            Top mérito (notas)
          </h2>
          <CBadge color="success">{{ students.length }}</CBadge>
        </div>
      </CCardHeader>
      <CCardBody class="px-3 px-md-4 pb-4">
        <p v-if="!preview.length" class="notes-empty mb-0">Sin notas en el alcance.</p>
        <div v-else class="notes-rank">
          <button
            v-for="item in preview"
            :key="item.student_id"
            type="button"
            class="notes-rank__item"
            @click="goToStudent(item)"
          >
            <span class="notes-rank__pos">#{{ item.rank }}</span>
            <span class="notes-rank__main">
              <strong>{{ item.full_name }}</strong>
              <small>{{ item.classroom_label }} · {{ item.courses_count }} curso(s)</small>
            </span>
            <span class="notes-rank__score">
              {{ item.average_label }} ({{ item.average_score }})
            </span>
          </button>
        </div>
        <CButton
          v-if="students.length > previewLimit"
          color="secondary"
          variant="outline"
          class="notes-rank__more mt-3"
          @click="listOpen = true"
        >
          Ver todos ({{ students.length }})
        </CButton>
      </CCardBody>
    </CCard>

    <CModal :visible="listOpen" alignment="center" scrollable size="lg" @close="listOpen = false">
      <CModalHeader>
        <CModalTitle>Ranking completo de mérito</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p class="text-body-secondary small">Respeta el bimestre, grado y sección de la consulta.</p>
        <div class="notes-rank">
          <button
            v-for="item in students"
            :key="`all-${item.student_id}`"
            type="button"
            class="notes-rank__item"
            @click="goToStudent(item)"
          >
            <span class="notes-rank__pos">#{{ item.rank }}</span>
            <span class="notes-rank__main">
              <strong>{{ item.full_name }}</strong>
              <small>{{ item.classroom_label }} · {{ item.courses_count }} curso(s)</small>
            </span>
            <span class="notes-rank__score">
              {{ item.average_label }} ({{ item.average_score }})
            </span>
          </button>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="listOpen = false">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NotesFilterCard from '@/components/notas/NotesFilterCard.vue'
import NotesService from '@/services/NotesService'

const router = useRouter()
const previewLimit = 10

const loading = ref(true)
const error = ref('')
const periodYear = ref('')
const bimesters = ref([])
const classrooms = ref([])
const bimester = ref(null)
const grade = ref('all')
const section = ref('all')
const students = ref([])
const listOpen = ref(false)

const currentBimesterLabel = computed(() => {
  const current = bimesters.value.find((item) => item.is_current)
  return current ? `B${current.number}` : ''
})

const canQuery = computed(() => Boolean(bimester.value))
const preview = computed(() => students.value.slice(0, previewLimit))

const loadMeta = async () => {
  const response = await NotesService.recordsMeta()
  const data = response.data?.data || {}
  periodYear.value = data.period?.year || ''
  bimesters.value = data.bimesters || []
  classrooms.value = data.classrooms || []
  bimester.value = data.default_bimester || bimesters.value[0]?.number || null
}

const loadRecords = async () => {
  if (!canQuery.value) {
    loading.value = false
    students.value = []
    return
  }
  loading.value = true
  error.value = ''
  listOpen.value = false
  try {
    const response = await NotesService.records({
      bimester: bimester.value,
      grade: grade.value,
      section: section.value,
    })
    if (response.data?.success === false) {
      students.value = []
      error.value = response.data?.message || 'No se pudo cargar el orden de mérito.'
      return
    }
    students.value = response.data?.data?.students || []
  } catch (err) {
    students.value = []
    error.value = err.response?.data?.message || 'Error al cargar el orden de mérito.'
  } finally {
    loading.value = false
  }
}

const goToStudent = (item) => {
  if (!item?.student_id) return
  router.push(`/edit-student/${item.student_id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await loadMeta()
    await loadRecords()
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudieron cargar los filtros.'
    loading.value = false
  }
})
</script>

<style scoped>
.notes-page {
  width: 100%;
  min-width: 0;
}

.notes-rank__title {
  font-size: 1rem;
  font-weight: 700;
}

.notes-empty {
  color: var(--rp-text-muted, #64748b);
}

.notes-rank {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.notes-rank__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 44px;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--rp-border, #e2e8f0);
  border-radius: 0.75rem;
  background: var(--rp-surface, #fff);
  text-align: left;
}

.notes-rank__item:hover {
  border-color: var(--rp-border-brand, #93c5fd);
  background: var(--rp-surface-brand-soft, #f4f8ff);
}

.notes-rank__pos {
  flex-shrink: 0;
  min-width: 2rem;
  font-weight: 700;
  color: var(--rp-text-brand, #1d4f91);
}

.notes-rank__main {
  min-width: 0;
  flex: 1;
}

.notes-rank__main strong,
.notes-rank__main small {
  display: block;
  overflow-wrap: anywhere;
}

.notes-rank__main small {
  color: var(--rp-text-muted, #64748b);
}

.notes-rank__score {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--rp-text-heading, #1e293b);
  text-align: right;
}

.notes-rank__more {
  min-height: 44px;
}
</style>

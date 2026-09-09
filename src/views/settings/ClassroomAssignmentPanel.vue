<template>
  <div class="assign-panel">
    <div class="assign-panel__toolbar">
      <div class="assign-panel__intro">
        <div class="assign-panel__title-row">
          <span class="assign-panel__icon" aria-hidden="true">
            <i class="fas fa-chalkboard-teacher"></i>
          </span>
          <div class="assign-panel__heading">
            <h5 class="assign-panel__title mb-0">Asignación por aula</h5>
            <p class="assign-panel__meta mb-0">
              Periodo:
              <strong>{{ periodLabel }}</strong>
            </p>
          </div>
        </div>

        <div v-if="activeAulaId && !loadingBoard && draftRows.length" class="assign-panel__stats">
          <span class="assign-panel__stat">
            Aula <strong>{{ activeAulaLabel }}</strong>
          </span>
          <span class="assign-panel__stat">
            <strong>{{ assignedCount }}</strong>/{{ draftRows.length }} con docente
          </span>
          <span v-if="isDirty" class="assign-panel__stat assign-panel__stat--dirty">
            Cambios sin guardar
          </span>
        </div>
      </div>

      <div class="assign-panel__filters">
        <div class="assign-panel__filter">
          <CFormLabel for="assign-grade" class="assign-panel__filter-label">Grado</CFormLabel>
          <CFormSelect
            id="assign-grade"
            v-model="selectedGrade"
            class="assign-panel__select"
            :disabled="loadingMeta || !gradeOptions.length"
            @change="onGradeChange"
          >
            <option value="">Seleccione</option>
            <option v-for="grade in gradeOptions" :key="grade" :value="grade">
              {{ grade }}°
            </option>
          </CFormSelect>
        </div>

        <div class="assign-panel__filter">
          <CFormLabel for="assign-section" class="assign-panel__filter-label">Sección</CFormLabel>
          <CFormSelect
            id="assign-section"
            v-model="selectedSection"
            class="assign-panel__select"
            :disabled="loadingMeta || !selectedGrade || !sectionOptions.length"
            @change="onSectionChange"
          >
            <option value="">Seleccione</option>
            <option v-for="section in sectionOptions" :key="section" :value="section">
              {{ section }}
            </option>
          </CFormSelect>
        </div>

        <div class="assign-panel__filter assign-panel__filter--action">
          <span class="assign-panel__filter-label assign-panel__filter-label--spacer" aria-hidden="true">
            &nbsp;
          </span>
          <CButton
            type="button"
            color="primary"
            class="assign-panel__search"
            :disabled="loadingMeta || loadingBoard || !canSearch"
            @click="searchClassroom"
          >
            <i class="fas fa-search me-2" aria-hidden="true"></i>
            {{ loadingBoard ? 'Buscando...' : 'Buscar' }}
          </CButton>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="assign-panel__error mb-0">{{ errorMessage }}</p>

    <div v-else-if="!activeAulaId" class="assign-panel__empty-state">
      <div class="assign-panel__empty-icon" aria-hidden="true">
        <i class="fas fa-door-open"></i>
      </div>
      <p class="assign-panel__empty-title mb-1">Busque un aula</p>
      <p class="assign-panel__empty-text mb-0">
        Elija grado y sección, luego pulse <strong>Buscar</strong> para asignar docentes.
      </p>
    </div>

    <div v-else class="assign-panel__body">
      <div v-if="loadingBoard" class="assign-panel__empty-state assign-panel__empty-state--compact">
        <p class="assign-panel__empty-text mb-0">Cargando cursos del aula...</p>
      </div>

      <template v-else>
        <div v-if="!draftRows.length" class="assign-panel__empty-state assign-panel__empty-state--compact">
          <p class="assign-panel__empty-title mb-1">Sin cursos</p>
          <p class="assign-panel__empty-text mb-0">
            Este aula no tiene cursos en el periodo activo.
          </p>
        </div>

        <template v-else>
          <div class="assign-panel__list" role="list">
            <article
              v-for="(row, index) in draftRows"
              :key="row.course_class_id"
              class="assign-row"
              :class="{
                'assign-row--locked': row.has_scores,
                'assign-row--empty': !row.teacher_id,
                'assign-row--dirty': isRowDirty(row),
              }"
              role="listitem"
            >
              <div class="assign-row__index" aria-hidden="true">{{ index + 1 }}</div>

              <div class="assign-row__main">
                <div class="assign-row__course">
                  <h6 class="assign-row__name mb-0">{{ row.course_name || '—' }}</h6>
                  <div class="assign-row__tags">
                    <span v-if="row.has_scores" class="assign-tag assign-tag--lock">
                      <i class="fas fa-lock" aria-hidden="true"></i>
                      Con notas
                    </span>
                    <span
                      v-else-if="!row.teacher_id"
                      class="assign-tag assign-tag--pending"
                    >
                      Sin docente
                    </span>
                    <span
                      v-if="row.has_schedule"
                      class="assign-tag assign-tag--schedule"
                    >
                      <i class="fas fa-clock" aria-hidden="true"></i>
                      Horario
                    </span>
                  </div>
                </div>

                <div class="assign-row__controls">
                  <div class="assign-row__field">
                    <label
                      class="assign-row__label"
                      :for="`teacher-${row.course_class_id}`"
                    >
                      Docente
                    </label>
                    <CFormSelect
                      :id="`teacher-${row.course_class_id}`"
                      v-model="row.teacher_id"
                      class="assign-panel__teacher-select"
                      :disabled="saving || row.has_scores"
                      :aria-label="`Docente de ${row.course_name}`"
                    >
                      <option value="">Sin docente</option>
                      <option
                        v-for="teacher in teachers"
                        :key="teacher.id"
                        :value="String(teacher.id)"
                      >
                        {{ teacher.label }}
                      </option>
                    </CFormSelect>
                  </div>

                  <CButton
                    type="button"
                    color="info"
                    variant="outline"
                    size="sm"
                    class="assign-panel__schedule-btn"
                    :disabled="saving || !row.course_class_id"
                    title="Horario opcional"
                    @click="openSchedule(row)"
                  >
                    <i class="fas fa-clock" aria-hidden="true"></i>
                    <span class="assign-panel__schedule-label">
                      {{ row.has_schedule ? 'Editar horario' : 'Horario (opc.)' }}
                    </span>
                  </CButton>
                </div>
              </div>
            </article>
          </div>

          <div class="assign-panel__footer">
            <p class="assign-panel__footer-hint mb-0">
              <template v-if="isDirty">Hay cambios pendientes de guardar.</template>
              <template v-else>Los horarios se guardan por separado en cada curso.</template>
            </p>
            <CButton
              type="button"
              color="primary"
              class="assign-panel__save"
              :disabled="saving || !draftRows.length || !isDirty"
              @click="saveAssignments"
            >
              {{ saving ? 'Guardando...' : 'Guardar asignación' }}
            </CButton>
          </div>
        </template>
      </template>
    </div>

    <ModalCourseSchedule
      v-model:isOpenModal="scheduleModalOpen"
      :course-class="scheduleCourseClass"
      @saved="onScheduleSaved"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import CourseClassService from '@/services/CourseClassService'
import ModalCourseSchedule from '@/views/teachers/modals/ModalCourseSchedule.vue'

const loadingMeta = ref(false)
const loadingBoard = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const period = ref(null)
const aulas = ref([])
const teachers = ref([])
const selectedGrade = ref('')
const selectedSection = ref('')
const activeAulaId = ref('')
const activeAulaLabel = ref('')
const draftRows = ref([])
const originalTeachers = ref({})

const scheduleModalOpen = ref(false)
const scheduleCourseClass = ref(null)

const periodLabel = computed(() => period.value?.name || '—')

const gradeOptions = computed(() => {
  const grades = aulas.value.map((aula) => String(aula.grade ?? '')).filter(Boolean)
  return [...new Set(grades)].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
})

const sectionOptions = computed(() => {
  if (!selectedGrade.value) return []
  const sections = aulas.value
    .filter((aula) => String(aula.grade) === String(selectedGrade.value))
    .map((aula) => String(aula.section ?? ''))
    .filter(Boolean)
  return [...new Set(sections)].sort((a, b) => a.localeCompare(b))
})

const matchedAula = computed(() => {
  if (!selectedGrade.value || !selectedSection.value) return null
  return (
    aulas.value.find(
      (aula) =>
        String(aula.grade) === String(selectedGrade.value) &&
        String(aula.section) === String(selectedSection.value),
    ) || null
  )
})

const canSearch = computed(() => Boolean(matchedAula.value))

const assignedCount = computed(
  () => draftRows.value.filter((row) => row.teacher_id !== '' && row.teacher_id != null).length,
)

const normalizeTeacherId = (value) =>
  value === '' || value == null ? null : String(value)

const isRowDirty = (row) => {
  const current = normalizeTeacherId(row.teacher_id)
  const baseline = normalizeTeacherId(originalTeachers.value[row.course_class_id])
  return current !== baseline
}

const isDirty = computed(() => draftRows.value.some((row) => isRowDirty(row)))

const normalizeRows = (courses = []) =>
  (courses || []).map((item) => ({
    ...item,
    teacher_id:
      item.teacher_id === null || item.teacher_id === undefined || item.teacher_id === ''
        ? ''
        : String(item.teacher_id),
  }))

const snapshotTeachers = (rows) => {
  const map = {}
  rows.forEach((row) => {
    map[row.course_class_id] = normalizeTeacherId(row.teacher_id)
  })
  return map
}

const loadMeta = async () => {
  loadingMeta.value = true
  errorMessage.value = ''
  try {
    const response = await CourseClassService.getClassroomBoard()
    const data = response.data?.data || {}
    period.value = data.period || null
    aulas.value = data.aulas || []
    teachers.value = data.teachers || []
  } catch (error) {
    period.value = null
    aulas.value = []
    teachers.value = []
    errorMessage.value =
      error.response?.data?.message || 'No se pudo cargar la asignación por aula.'
  } finally {
    loadingMeta.value = false
  }
}

const clearBoard = () => {
  activeAulaId.value = ''
  activeAulaLabel.value = ''
  draftRows.value = []
  originalTeachers.value = {}
  errorMessage.value = ''
}

const loadBoard = async (aula) => {
  if (!aula?.id) {
    clearBoard()
    return
  }

  loadingBoard.value = true
  errorMessage.value = ''
  try {
    const response = await CourseClassService.getClassroomBoard(Number(aula.id))
    const data = response.data?.data || {}
    period.value = data.period || period.value
    if (data.teachers?.length) teachers.value = data.teachers
    if (data.aulas?.length) aulas.value = data.aulas

    activeAulaId.value = String(aula.id)
    activeAulaLabel.value = data.classroom?.label || aula.label || `${aula.grade}° ${aula.section}`

    const courses = normalizeRows(data.classroom?.courses || [])
    draftRows.value = courses
    originalTeachers.value = snapshotTeachers(courses)
  } catch (error) {
    clearBoard()
    errorMessage.value =
      error.response?.data?.message || 'No se pudieron cargar los cursos del aula.'
  } finally {
    loadingBoard.value = false
  }
}

const onGradeChange = () => {
  selectedSection.value = ''
  clearBoard()
}

const onSectionChange = () => {
  clearBoard()
}

const searchClassroom = async () => {
  if (!matchedAula.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Seleccione aula',
      text: 'Elija grado y sección antes de buscar.',
    })
    return
  }

  if (isDirty.value) {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Cambios sin guardar',
      text: 'Hay cambios pendientes. ¿Desea buscar de todos modos y descartarlos?',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return
  }

  await loadBoard(matchedAula.value)
}

const openSchedule = (row) => {
  const aula =
    aulas.value.find((item) => String(item.id) === String(activeAulaId.value)) || matchedAula.value
  scheduleCourseClass.value = {
    course_class_id: row.course_class_id,
    course_name: row.course_name,
    grade: row.grade ?? aula?.grade,
    section: row.section ?? aula?.section,
  }
  scheduleModalOpen.value = true
}

const onScheduleSaved = async () => {
  const aula =
    aulas.value.find((item) => String(item.id) === String(activeAulaId.value)) || matchedAula.value
  if (aula) await loadBoard(aula)
}

const saveAssignments = async () => {
  if (!activeAulaId.value || !draftRows.value.length) return

  saving.value = true
  try {
    const payload = {
      grade_section_id: Number(activeAulaId.value),
      assignments: draftRows.value.map((row) => ({
        course_class_id: row.course_class_id,
        teacher_id: row.teacher_id === '' ? null : Number(row.teacher_id),
      })),
    }

    const response = await CourseClassService.saveByClassroom(payload)
    const classroom = response.data?.data?.classroom
    const courses = normalizeRows(classroom?.courses || draftRows.value)
    draftRows.value = courses
    originalTeachers.value = snapshotTeachers(courses)

    await Swal.fire({
      icon: 'success',
      title: 'Guardado',
      text: response.data?.message || 'Asignación del aula guardada correctamente.',
      timer: 1800,
      showConfirmButton: false,
    })
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo guardar',
      text:
        error.response?.data?.message ||
        'Ocurrió un error al guardar la asignación del aula.',
    })
    const aula =
      aulas.value.find((item) => String(item.id) === String(activeAulaId.value)) || matchedAula.value
    if (aula) await loadBoard(aula)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadMeta()
})
</script>

<style scoped>
.assign-panel {
  background:
    linear-gradient(
      180deg,
      var(--rp-surface-brand-soft) 0,
      transparent 9rem
    ),
    var(--rp-surface-muted);
  min-height: 18rem;
}

.assign-panel__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  padding: var(--rp-space-3);
  border-bottom: 1px solid var(--rp-border-brand);
  background:
    linear-gradient(
      135deg,
      rgba(var(--rp-brand-rgb), 0.12) 0%,
      rgba(var(--rp-brand-rgb), 0.04) 48%,
      var(--rp-surface) 100%
    );
}

.assign-panel__intro {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-2);
}

.assign-panel__title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--rp-space-3);
}

.assign-panel__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rp-radius-md, 0.65rem);
  background: var(--rp-brand-500);
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 6px 14px rgba(var(--rp-brand-rgb), 0.28);
}

.assign-panel__heading {
  min-width: 0;
}

.assign-panel__title {
  font-size: var(--rp-text-base, 1rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-heading, var(--rp-text));
  line-height: var(--rp-leading-tight, 1.25);
}

.assign-panel__meta {
  margin-top: 0.2rem;
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text-muted);
}

.assign-panel__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.assign-panel__stat {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.6rem;
  border-radius: var(--rp-radius-sm, 0.4rem);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
  color: var(--rp-text-muted);
  font-size: var(--rp-text-2xs, 0.7rem);
  font-weight: var(--rp-weight-semibold, 600);
  letter-spacing: 0.01em;
}

.assign-panel__stat--dirty {
  background: var(--rp-warning-50, #fff7ed);
  border-color: var(--rp-warning-200, #fed7aa);
  color: var(--rp-warning-700, #b54708);
}

.assign-panel__filters {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-2);
}

.assign-panel__filter {
  width: 100%;
  min-width: 0;
}

.assign-panel__filter-label {
  margin-bottom: 0.35rem;
  font-size: var(--rp-text-sm, 0.875rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-muted);
}

.assign-panel__filter-label--spacer {
  display: none;
}

.assign-panel__select,
.assign-panel__teacher-select {
  width: 100%;
  min-height: 44px;
  background: var(--rp-surface);
  border-color: var(--rp-border, #d0d7e2);
}

.assign-panel__search {
  width: 100%;
  min-height: 44px;
  font-weight: 600;
}

.assign-panel__error {
  margin: 0;
  padding: var(--rp-space-3) var(--rp-space-4);
  color: var(--rp-danger-700, #b42318);
  background: var(--rp-danger-50, #fef3f2);
  border-bottom: 1px solid var(--rp-danger-200, #fecdca);
  font-size: var(--rp-text-sm, 0.875rem);
}

.assign-panel__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.35rem;
  padding: 2.5rem 1.25rem;
  color: var(--rp-text-muted);
}

.assign-panel__empty-state--compact {
  padding: 1.75rem 1.25rem;
}

.assign-panel__empty-icon {
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 0.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
  color: var(--rp-brand-500);
  font-size: 1.15rem;
}

.assign-panel__empty-title {
  font-size: var(--rp-text-base, 1rem);
  font-weight: var(--rp-weight-semibold, 600);
  color: var(--rp-text-heading, var(--rp-text));
}

.assign-panel__empty-text {
  max-width: 22rem;
  font-size: var(--rp-text-sm, 0.875rem);
  line-height: 1.45;
  color: var(--rp-text-muted);
}

.assign-panel__body {
  padding: 0;
}

.assign-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: var(--rp-space-3);
}

.assign-row {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
  border-radius: var(--rp-radius-md, 0.75rem);
  background: var(--rp-surface);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.assign-row:hover {
  border-color: var(--rp-border-brand);
  box-shadow: 0 4px 12px rgba(var(--rp-brand-rgb), 0.08);
}

.assign-row--empty {
  background:
    linear-gradient(90deg, rgba(var(--rp-brand-rgb), 0.05), transparent 42%),
    var(--rp-surface);
}

.assign-row--locked {
  border-color: var(--rp-warning-200, #fed7aa);
  background:
    linear-gradient(90deg, var(--rp-warning-50, #fff7ed), var(--rp-surface) 38%);
}

.assign-row--dirty {
  border-color: var(--rp-brand-300);
  box-shadow: 0 0 0 1px rgba(var(--rp-brand-rgb), 0.18);
}

.assign-row__index {
  flex-shrink: 0;
  width: 1.65rem;
  height: 1.65rem;
  margin-top: 0.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--rp-surface-sunken);
  color: var(--rp-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.assign-row__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assign-row__course {
  min-width: 0;
}

.assign-row__name {
  font-size: 0.95rem;
  font-weight: 650;
  color: var(--rp-text-heading, var(--rp-text));
  line-height: 1.3;
  word-break: break-word;
}

.assign-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
}

.assign-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--rp-radius-sm, 0.4rem);
  font-size: 0.68rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.assign-tag--lock {
  background: var(--rp-warning-50, #fff7ed);
  color: var(--rp-warning-700, #b54708);
  border: 1px solid var(--rp-warning-200, #fed7aa);
}

.assign-tag--pending {
  background: var(--rp-surface-muted);
  color: var(--rp-text-muted);
  border: 1px solid var(--rp-border-subtle, var(--rp-border));
}

.assign-tag--schedule {
  background: var(--rp-surface-brand-soft);
  color: var(--rp-text-brand);
  border: 1px solid var(--rp-border-brand);
}

.assign-row__controls {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.assign-row__field {
  min-width: 0;
  flex: 1;
}

.assign-row__label {
  display: block;
  margin-bottom: 0.28rem;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--rp-text-muted);
}

.assign-panel__schedule-btn {
  min-height: 44px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 600;
}

.assign-panel__footer {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  padding: var(--rp-space-3);
  border-top: 1px solid var(--rp-border-subtle, var(--rp-border));
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.55),
      var(--rp-surface)
    );
  position: sticky;
  bottom: 0;
}

.assign-panel__footer-hint {
  font-size: var(--rp-text-sm, 0.875rem);
  color: var(--rp-text-muted);
}

.assign-panel__save {
  width: 100%;
  min-height: 44px;
  font-weight: 600;
}

@media (min-width: 768px) {
  .assign-panel__toolbar {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--rp-space-4);
    padding: var(--rp-space-4);
  }

  .assign-panel__icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .assign-panel__title {
    font-size: var(--rp-text-lg, 1.125rem);
  }

  .assign-panel__filters {
    width: auto;
    max-width: 28rem;
    flex-shrink: 0;
    grid-template-columns: minmax(5.5rem, 1fr) minmax(5.5rem, 1fr) auto;
    align-items: end;
    gap: var(--rp-space-2);
  }

  .assign-panel__filter-label--spacer {
    display: block;
  }

  .assign-panel__search {
    width: auto;
    min-width: 7.5rem;
    padding-inline: 1rem;
  }

  .assign-panel__list {
    padding: var(--rp-space-4);
    gap: 0.75rem;
  }

  .assign-row {
    padding: 1rem 1.1rem;
  }

  .assign-row__controls {
    flex-direction: row;
    align-items: flex-end;
  }

  .assign-panel__schedule-btn {
    width: auto;
    min-width: 9.5rem;
    flex-shrink: 0;
  }

  .assign-panel__footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--rp-space-3) var(--rp-space-4);
  }

  .assign-panel__save {
    width: auto;
    min-width: 13rem;
  }
}
</style>

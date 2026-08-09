<template>
  <div class="module-page course-competencies">
    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando competencias...
    </div>

    <EmptyState
      v-else-if="!competencies.length"
      icon="📋"
      title="Sin competencias configuradas"
      hint="Las competencias de esta área aparecerán cuando estén registradas en el catálogo."
    />

    <div v-else class="competency-list">
      <article
        v-for="item in competencies"
        :key="item.id"
        class="competency-card"
      >
        <header class="competency-card__header">
          <span class="competency-card__code">{{ item.number || item.code || '—' }}</span>
          <h3 class="competency-card__title">{{ item.name }}</h3>
        </header>
        <p class="competency-card__description">
          {{ item.description || 'Sin descripción registrada para esta competencia.' }}
        </p>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CompetencyScoreService from '@/services/CompetencyScoreService'
import EmptyState from '@/components/academic/EmptyState.vue'

const route = useRoute()
const courseClassId = Number(route.params.courseClass)
const loading = ref(true)
const loadError = ref('')
const competencies = ref([])

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await CompetencyScoreService.listByCourseClass(courseClassId)
    if (response.data?.success) {
      competencies.value = response.data?.data?.competencies || []
    } else {
      loadError.value = response.data?.message || 'No se pudieron cargar las competencias.'
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar competencias.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.competency-list {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
}

.competency-card {
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  padding: 1rem 1.1rem;
  box-shadow: var(--rp-shadow-xs);
}

.competency-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.45rem;
}

.competency-card__code {
  flex: 0 0 auto;
  min-width: 2.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-brand-soft, #e8f0fe);
  color: var(--rp-brand-600);
  font-weight: var(--rp-weight-semibold);
  font-size: 0.8rem;
  text-align: center;
}

.competency-card__title {
  margin: 0;
  font-size: var(--rp-text-md);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: 1.3;
}

.competency-card__description {
  margin: 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-base);
  line-height: 1.45;
  white-space: pre-wrap;
}
</style>

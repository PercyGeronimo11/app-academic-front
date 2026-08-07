<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4">
      <CCol xs="12" md="4">
        <div class="home-kpi home-kpi--alert">
          <div class="home-kpi__label">Alto + Crítico (mis aulas)</div>
          <div class="home-kpi__value">{{ kpis.high_or_critical ?? 0 }}</div>
          <div class="home-kpi__hint">{{ kpis.high ?? 0 }} alto · {{ kpis.critical ?? 0 }} crítico</div>
        </div>
      </CCol>
      <CCol xs="12" md="8">
        <section class="home-panel h-100">
          <div class="home-panel__head">
            <h2>Comunicados</h2>
            <router-link :to="links.announcements || '/my-announcements'">Ver todos</router-link>
          </div>
          <p class="home-panel__badge mb-2">{{ announcements.unread_count || 0 }} no leído(s)</p>
          <div v-if="!announcementItems.length" class="home-empty">Sin comunicados nuevos.</div>
          <ul v-else class="home-list">
            <li v-for="item in announcementItems" :key="item.id">
              <strong>{{ item.title }}</strong>
            </li>
          </ul>
        </section>
      </CCol>
    </CRow>

    <section class="home-panel mb-4">
      <div class="home-panel__head">
        <h2>Requieren atención</h2>
        <router-link :to="links.academic_risk || '/prediccion/dashboard'">Ver más</router-link>
      </div>
      <div v-if="!attention.length" class="home-empty">No hay alumnos alto/crítico en tus aulas.</div>
      <ul v-else class="home-list">
        <li v-for="item in attention" :key="item.student_id">
          <div>
            <strong>{{ item.full_name }}</strong>
            <span class="home-list__meta">{{ item.classroom_label }}</span>
          </div>
          <span :class="getRiskChipClass(item.risk_level)">{{ item.risk_label || getRiskLabel(item.risk_level) }}</span>
        </li>
      </ul>
    </section>

    <section class="home-panel">
      <div class="home-panel__head">
        <h2>Mis cursos</h2>
        <router-link :to="links.courses || '/courses/teacher/list'">Ver todos</router-link>
      </div>
      <div v-if="!courses.length" class="home-empty">No tienes cursos asignados.</div>
      <div v-else class="home-courses">
        <article v-for="course in courses" :key="course.course_class_id" class="home-course-card">
          <div>
            <h3>{{ course.course_name }}</h3>
            <p>{{ course.classroom_label || '—' }}</p>
          </div>
          <div class="home-course-card__actions">
            <router-link :to="course.assistance_url">Asistencia hoy</router-link>
            <router-link :to="course.detail_url">Detalle</router-link>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

const props = defineProps({
  data: { type: Object, required: true },
})

const kpis = computed(() => props.data.kpis || {})
const links = computed(() => props.data.links || {})
const attention = computed(() => props.data.attention || [])
const courses = computed(() => props.data.courses || [])
const announcements = computed(() => props.data.announcements || {})
const announcementItems = computed(() => announcements.value.items || [])
</script>

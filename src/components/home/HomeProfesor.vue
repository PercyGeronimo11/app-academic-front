<template>
  <div class="home-stack">
    <CRow class="g-3 mb-4 home-student-kpis">
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Alto + Crítico (mis aulas)"
          :value="String(kpis.high_or_critical ?? 0)"
          :hint="`${kpis.high ?? 0} alto · ${kpis.critical ?? 0} crítico`"
          cta="Ver riesgo"
          :to="links.academic_risk || '/prediccion/dashboard'"
          icon="fa-exclamation-triangle"
          tone="alert"
        />
      </CCol>
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Mis cursos"
          :value="String(courses.length)"
          hint="Cursos asignados este periodo"
          cta="Ver cursos"
          :to="links.courses || '/mainAreaTeacher'"
          icon="fa-chalkboard-teacher"
          tone="brand"
        />
      </CCol>
      <CCol xs="12" md="4">
        <HomeStudentKpiCard
          label="Comunicados sin leer"
          :value="String(announcements.unread_count || 0)"
          hint="Avisos vigentes"
          cta="Ver comunicados"
          :to="links.announcements || '/my-announcements'"
          icon="fa-bullhorn"
          tone="indigo"
        />
      </CCol>
    </CRow>

    <div class="home-quick-links mb-4">
      <router-link class="home-quick-link" :to="links.courses || '/mainAreaTeacher'">
        <i class="fas fa-book" aria-hidden="true"></i>
        Mis cursos
      </router-link>
      <router-link class="home-quick-link" :to="links.academic_risk || '/prediccion/dashboard'">
        <i class="fas fa-chart-line" aria-hidden="true"></i>
        Riesgo académico
      </router-link>
      <router-link class="home-quick-link" to="/announcements/publish">
        <i class="fas fa-pen" aria-hidden="true"></i>
        Publicar comunicado
      </router-link>
      <router-link class="home-quick-link" :to="links.announcements || '/my-announcements'">
        <i class="fas fa-envelope-open" aria-hidden="true"></i>
        Ver comunicados
      </router-link>
    </div>

    <section class="home-panel mb-4">
      <div class="home-panel__head">
        <h2>
          <i class="fas fa-user-graduate home-panel__title-icon" aria-hidden="true"></i>
          Requieren atención
        </h2>
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
        <h2>
          <i class="fas fa-chalkboard home-panel__title-icon" aria-hidden="true"></i>
          Mis cursos
        </h2>
        <router-link :to="links.courses || '/mainAreaTeacher'">Ver todos</router-link>
      </div>
      <div v-if="!courses.length" class="home-empty">No tienes cursos asignados.</div>
      <div v-else class="home-courses">
        <article v-for="course in courses" :key="course.course_class_id" class="home-course-card home-course-card--rich">
          <div class="home-course-card__icon" aria-hidden="true">
            <i class="fas fa-book"></i>
          </div>
          <div class="home-course-card__body">
            <h3>{{ course.course_name }}</h3>
            <p>{{ course.classroom_label || '—' }}</p>
            <div class="home-course-card__actions">
              <router-link :to="course.assistance_url">Asistencia hoy</router-link>
              <router-link :to="course.detail_url">Detalle</router-link>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeStudentKpiCard from '@/components/home/HomeStudentKpiCard.vue'
import { getRiskChipClass, getRiskLabel } from '@/utils/academicRisk'

const props = defineProps({
  data: { type: Object, required: true },
})

const kpis = computed(() => props.data.kpis || {})
const links = computed(() => props.data.links || {})
const attention = computed(() => props.data.attention || [])
const courses = computed(() => props.data.courses || [])
const announcements = computed(() => props.data.announcements || {})
</script>

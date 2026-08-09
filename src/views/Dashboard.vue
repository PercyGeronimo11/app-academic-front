<template>
  <div class="home-page module-page">
    <header class="home-hero mb-4">
      <div>
        <p class="home-hero__eyebrow mb-1">Área principal</p>
        <h1 class="home-hero__title mb-1">{{ title }}</h1>
        <p v-if="subtitle" class="home-hero__subtitle mb-0">{{ subtitle }}</p>
      </div>
      <div v-if="periodLabel" class="home-period-chip">
        <i class="fas fa-calendar-alt"></i>
        <div>
          <strong>{{ periodLabel }}</strong>
          <span v-if="periodRange">{{ periodRange }}</span>
          <span v-if="bimesterLabel">{{ bimesterLabel }}</span>
        </div>
      </div>
    </header>

    <div v-if="loading" class="text-body-secondary py-4">Cargando inicio...</div>
    <div v-else-if="error" class="alert alert-warning">{{ error }}</div>

    <template v-else-if="home">
      <HomeDireccion v-if="home.role === 'DIRECCION'" :data="home" />
      <HomeAuxiliar v-else-if="home.role === 'AUXILIAR'" :data="home" />
      <HomeProfesor v-else-if="home.role === 'PROFESOR'" :data="home" />
      <HomeEstudiante v-else-if="home.role === 'ESTUDIANTE'" :data="home" />
      <HomeSecretaria v-else-if="home.role === 'SECRETARIA'" :data="home" />
      <HomePlaceholder v-else :data="home" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DashboardService from '@/services/DashboardService'
import HomeDireccion from '@/components/home/HomeDireccion.vue'
import HomeAuxiliar from '@/components/home/HomeAuxiliar.vue'
import HomeProfesor from '@/components/home/HomeProfesor.vue'
import HomeEstudiante from '@/components/home/HomeEstudiante.vue'
import HomeSecretaria from '@/components/home/HomeSecretaria.vue'
import HomePlaceholder from '@/components/home/HomePlaceholder.vue'

const loading = ref(true)
const error = ref('')
const home = ref(null)

const ROLE_TITLES = {
  DIRECCION: 'Dashboard Dirección',
  AUXILIAR: 'Dashboard Auxiliar',
  PROFESOR: 'Área principal',
  ESTUDIANTE: 'Área principal',
  SECRETARIA: 'Dashboard Mesa de partes',
}

const title = computed(() => ROLE_TITLES[home.value?.role] || 'Dashboard')

const subtitle = computed(() => {
  const role = home.value?.role
  if (role === 'DIRECCION') return 'Pulso del colegio: riesgo, asistencia, trámites y comunicados.'
  if (role === 'AUXILIAR') return 'Asistencia del día, seguimiento y trámites por completar.'
  if (role === 'PROFESOR') return 'Tus cursos, alumnos en riesgo y comunicados.'
  if (role === 'ESTUDIANTE') return 'Tu riesgo, asistencia, libreta, trámites y novedades.'
  if (role === 'SECRETARIA') return 'Bandeja de trámites, observados y avisos de mesa de partes.'
  return ''
})

const periodLabel = computed(() => home.value?.period?.name || null)

const periodRange = computed(() => {
  const p = home.value?.period
  if (!p?.start_time || !p?.end_time) return ''
  return `${formatDate(p.start_time)} – ${formatDate(p.end_time)}`
})

const bimesterLabel = computed(() => {
  const b = home.value?.bimester
  if (!b?.name && !b?.number) return ''
  return b.name || `Bimestre ${b.number}`
})

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  try {
    const response = await DashboardService.getHome()
    if (!response.data?.success) {
      error.value = response.data?.message || 'No se pudo cargar el inicio.'
      return
    }
    home.value = response.data.data
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar el inicio. Intente nuevamente.'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
@import '@/styles/home.scss';
</style>

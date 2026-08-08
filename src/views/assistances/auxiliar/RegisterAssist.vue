<template>
  <div class="module-page register-assist-page">
    <CCard class="border-0 shadow-sm mb-3">
      <CCardBody class="p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <h5 class="fw-bold text-primary mb-0 d-flex align-items-center">
            <i class="fas fa-user-check me-2"></i>
            Registrar asistencia
          </h5>
        </div>

        <nav class="register-tabs" aria-label="Modos de registro">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="register-tabs__item"
            :class="{ 'is-active': activeTab === tab.id }"
            @click="setTab(tab.id)"
          >
            <i :class="tab.icon" aria-hidden="true"></i>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <!-- Filtros del modo buscar (inyectados desde RegisterDniAssist) -->
        <div id="assist-register-filters" class="mt-3"></div>
      </CCardBody>
    </CCard>

    <!-- v-if: al salir de QR se desmonta y apaga la cámara -->
    <RegisterQrAssist v-if="activeTab === 'qr'" embedded />
    <RegisterDniAssist v-else-if="activeTab === 'buscar'" embedded />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RegisterQrAssist from '@/views/assistances/auxiliar/RegisterQrAssist.vue'
import RegisterDniAssist from '@/views/assistances/auxiliar/RegisterDniAssist.vue'

const VALID_TABS = ['qr', 'buscar']

const tabs = [
  { id: 'qr', label: 'Reg. por QR', icon: 'fas fa-qrcode' },
  { id: 'buscar', label: 'Buscar alumno', icon: 'fas fa-search' },
]

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  const tab = String(route.query.tab || '')
  return VALID_TABS.includes(tab) ? tab : 'qr'
})

const setTab = (tab) => {
  if (tab === activeTab.value && route.query.tab === tab) return
  router.replace({ path: '/assistances/registrar', query: { tab } })
}

const ensureTabQuery = () => {
  if (!VALID_TABS.includes(String(route.query.tab || ''))) {
    router.replace({ path: '/assistances/registrar', query: { tab: 'qr' } })
  }
}

watch(
  () => route.query.tab,
  () => {
    ensureTabQuery()
  },
)

onMounted(() => {
  ensureTabQuery()
})
</script>

<style scoped>
.register-assist-page {
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .register-assist-page {
    padding-top: 0.75rem;
  }
}

.register-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.3rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface-muted);
  border: 1px solid var(--rp-border);
}

.register-tabs__item {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--rp-text-secondary, #64748b);
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0.55rem 1rem;
  border-radius: calc(var(--rp-radius-md) - 2px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: background 0.15s ease, color 0.15s ease;
}

.register-tabs__item:hover {
  color: var(--rp-text-heading, #0f172a);
  background: color-mix(in srgb, var(--rp-surface) 70%, transparent);
}

.register-tabs__item.is-active {
  color: #fff;
  background: var(--cui-info, #3d94d6);
  box-shadow: var(--rp-shadow-xs);
}
</style>

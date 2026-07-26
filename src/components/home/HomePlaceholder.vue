<template>
  <div class="home-panel home-panel--placeholder">
    <h2 class="mb-2">{{ data.message || 'Dashboard en preparación' }}</h2>
    <p class="text-body-secondary mb-3">
      Pronto verás aquí tu cola de trabajo y accesos rápidos.
    </p>
    <div class="d-flex flex-wrap gap-2">
      <router-link
        v-if="data.links?.requests"
        class="btn btn-primary"
        :to="data.links.requests"
      >
        Ir a trámites
      </router-link>
      <router-link
        v-if="data.links?.announcements"
        class="btn btn-outline-secondary"
        :to="data.links.announcements"
      >
        Comunicados
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Object, required: true },
})
</script>

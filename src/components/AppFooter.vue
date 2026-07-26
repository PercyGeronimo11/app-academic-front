<template>
  <CFooter class="px-4">
    <div class="app-footer__inner">
      <span>&copy; {{ currentYear }} I.E. Ricardo Palma 80010</span>
      <span>Sistema de Gestión Académica</span>
    </div>
  </CFooter>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="tls-root">
    <div v-if="$slots.intro" class="tls-intro">
      <slot name="intro" />
    </div>
    <div v-if="$slots.toolbar" >
      <slot name="toolbar" />
    </div>
    <div class="tls-table-wrap">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * Contenedor visual para listas de trámites. Envuelve un <CTable> del proyecto.
 * Su apariencia (clases .tls-*) se define en `src/styles/design-system/tables.css`
 * junto al resto de las tablas del sistema.
 */
</script>

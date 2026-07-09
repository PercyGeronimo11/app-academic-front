<template>
  <div class="module-empty-state" :class="{ compact }">
    <div class="table-empty-unified">
      <span class="table-empty-unified__icon" aria-hidden="true">{{ icon }}</span>
      <p class="table-empty-unified__title">{{ title }}</p>
      <p v-if="hint" class="table-empty-unified__hint">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📋' },
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  compact: { type: Boolean, default: false },
});
</script>

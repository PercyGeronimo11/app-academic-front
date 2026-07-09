<template>
  <header class="module-page-header">
    <div class="module-page-header__main">
      <div v-if="icon" class="module-page-header__icon" aria-hidden="true">
        <i :class="icon"></i>
      </div>
      <div class="module-page-header__text">
        <h1 class="module-page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="module-page-header__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="module-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
});
</script>

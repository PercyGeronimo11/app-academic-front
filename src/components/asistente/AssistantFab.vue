<template>
  <button
    type="button"
    class="assistant-fab"
    title="Asistente Inteligente"
    aria-label="Abrir Asistente Inteligente"
    @click="goToAssistant"
  >
    <i class="fas fa-wand-magic-sparkles"></i>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAssistant = () => {
  router.push('/asistente-inteligente')
}
</script>

<style scoped>
.assistant-fab {
  position: fixed;
  right: var(--rp-space-6);
  bottom: var(--rp-space-6);
  z-index: var(--rp-z-fab);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--rp-brand-600);
  border-radius: var(--rp-radius-pill);
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  font-size: var(--rp-text-xl);
  box-shadow: var(--rp-shadow-md);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.assistant-fab:hover {
  background: var(--rp-brand-600);
  box-shadow: var(--rp-shadow-lg);
}

.assistant-fab:focus-visible {
  outline: none;
  box-shadow: var(--rp-shadow-focus);
}

@media (max-width: 575.98px) {
  .assistant-fab {
    right: var(--rp-space-4);
    bottom: var(--rp-space-4);
    width: 2.75rem;
    height: 2.75rem;
    font-size: var(--rp-text-lg);
  }
}
</style>

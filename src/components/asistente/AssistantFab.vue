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
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 1050;
  width: 3.6rem;
  height: 3.6rem;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #0072ff 0%, #00c6ff 100%);
  color: #fff;
  font-size: 1.35rem;
  box-shadow: 0 10px 28px rgba(0, 114, 255, 0.35);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.assistant-fab:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 32px rgba(0, 114, 255, 0.45);
}
</style>

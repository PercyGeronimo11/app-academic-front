<template>
  <span class="score-pill" :class="score ? `score-pill--${score.toLowerCase()}` : 'score-pill--empty'">
    {{ score || '—' }}
  </span>
</template>

<script setup>
defineProps({
  score: { type: String, default: '' },
});
</script>

<template>
  <router-link :to="url" class="card">
    <div v-if="displayImage" class="image-wrapper">
      <img :src="displayImage" :alt="title" class="card-image" />
    </div>
    <div v-else class="no-image" :style="{ backgroundColor: solidColor }">
      <span class="no-image-text">{{ title.charAt(0) }}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { resolveCourseCardImage } from '@/utils/courseDefaultImages'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const displayImage = computed(() => resolveCourseCardImage(props.image, props.title))

const solidColor = computed(() => {
  const colorMap = {
    A: '#FF6B6B',
    B: '#4ECDC4',
    C: '#FF9F1C',
    D: '#1A535C',
    E: '#FF6F61',
    F: '#2A9D8F',
    G: '#F4A261',
    H: '#264653',
    I: '#E76F51',
    J: '#E9C46A',
    K: '#F4A460',
    L: '#A5B4FC',
    M: '#C3DAFE',
    N: '#FDE68A',
    O: '#E9A8D4',
    P: '#86EFAC',
    Q: '#8A4D76',
    R: '#8338EC',
    S: '#3A86FF',
    T: '#FB5607',
    U: '#FF006E',
    V: '#FFD166',
    W: '#06D6A0',
    X: '#118AB2',
    Y: '#073B4C',
    Z: '#EF476F',
  }
  return colorMap[props.title.charAt(0).toUpperCase()] || '#A0AEC0'
})
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 22rem;
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  background-color: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
  overflow: hidden;
  text-decoration: none;
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.card:hover {
  border-color: var(--rp-border-brand);
  box-shadow: var(--rp-shadow-sm);
}

.card:focus-visible {
  outline: none;
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.image-wrapper {
  height: 9.5rem;
  overflow: hidden;
  background: var(--rp-surface-sunken);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-image {
  height: 9.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image-text {
  font-size: var(--rp-text-2xl);
  color: var(--rp-text-on-brand);
  font-weight: var(--rp-weight-semibold);
}

.card-content {
  padding: var(--rp-space-4);
  text-align: start;
}

.card-title {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-snug);
  color: var(--rp-text-heading);
  margin: 0;
}

.card-subtitle {
  font-size: var(--rp-text-base);
  color: var(--rp-text-muted);
  margin: var(--rp-space-1) 0 0;
}

@media (max-width: 575.98px) {
  .card {
    max-width: 100%;
  }

  .image-wrapper,
  .no-image {
    height: 8rem;
  }

  .card-content {
    padding: var(--rp-space-3);
  }

  .card-title {
    font-size: var(--rp-text-md);
  }
}
</style>

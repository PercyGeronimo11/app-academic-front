<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to || undefined"
    class="home-kpi home-kpi--iconed home-kpi--equal"
    :class="[
      toneClass,
      { 'home-kpi--link': Boolean(to) },
    ]"
  >
    <div class="home-kpi__icon" :class="iconToneClass" aria-hidden="true">
      <i class="fas" :class="icon"></i>
    </div>
    <div class="home-kpi__body">
      <div class="home-kpi__label">{{ label }}</div>
      <div class="home-kpi__value home-kpi__value--sm">
        <slot name="value">{{ value }}</slot>
      </div>
      <div v-if="hint || $slots.hint" class="home-kpi__hint">
        <slot name="hint">{{ hint }}</slot>
      </div>
      <div v-if="cta" class="home-kpi__cta home-kpi__cta--static">
        {{ cta }}
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </div>
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  hint: { type: String, default: '' },
  cta: { type: String, default: '' },
  to: { type: String, default: '' },
  icon: { type: String, required: true },
  /** slate | blue | brand | indigo | amber | ok | alert */
  tone: { type: String, default: 'slate' },
})

const toneClass = computed(() => {
  const map = {
    slate: 'home-kpi--slate',
    blue: 'home-kpi--brand',
    brand: 'home-kpi--brand',
    indigo: 'home-kpi--indigo',
    amber: 'home-kpi--amber',
    ok: 'home-kpi--ok',
    alert: 'home-kpi--alert',
  }
  return map[props.tone] || map.slate
})

const iconToneClass = computed(() => {
  const map = {
    slate: 'home-kpi__icon--slate',
    blue: 'home-kpi__icon--brand',
    brand: 'home-kpi__icon--brand',
    indigo: 'home-kpi__icon--indigo',
    amber: 'home-kpi__icon--amber',
    ok: 'home-kpi__icon--ok',
    alert: 'home-kpi__icon--alert',
  }
  return map[props.tone] || map.slate
})
</script>

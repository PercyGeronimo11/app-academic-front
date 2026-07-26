<template>
  <div class="card-container">
    <div class="card-header">
      <h4>{{ title }}</h4>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardComponent',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.card-container {
  border-radius: var(--rp-radius-lg);
  border: 1px solid var(--rp-border);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
  overflow: hidden;
}

.card-header {
  background: var(--rp-surface-muted);
  color: var(--rp-text-heading);
  padding: var(--rp-space-3) var(--rp-space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-3);
  border-bottom: 1px solid var(--rp-border-subtle);
}

.card-header h4 {
  margin: 0;
  font-size: var(--rp-text-md);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-snug);
  color: inherit;
}

.card-body {
  padding: var(--rp-space-5);
  font-size: var(--rp-text-base);
  line-height: var(--rp-leading-normal);
  color: var(--rp-text);
}

.card-body > * + * {
  margin-top: var(--rp-space-3);
}

@media (max-width: 767.98px) {
  .card-header {
    padding: var(--rp-space-3) var(--rp-space-4);
  }

  .card-body {
    padding: var(--rp-space-4);
  }
}
</style>

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
  border-radius: 12px;
  border: 1px solid var(--color-border, #E5E9F0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-container:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(90deg, var(--color-primary, #176FB6), var(--color-additional, #3192f3));
  color: #fff;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.card-body {
  padding: 18px;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Opcional: efecto sutil para secciones dentro del contenido */
.card-body > * + * {
  margin-top: 10px;
}
</style>

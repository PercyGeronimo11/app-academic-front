<template>
  <div class="tls-root">
    <div v-if="$slots.intro" class="tls-intro">
      <slot name="intro" />
    </div>
    <div v-if="$slots.toolbar" class="tls-toolbar">
      <slot name="toolbar" />
    </div>
    <div class="tls-table-wrap">
      <slot />
    </div>
  </div>
</template>

<script setup>
/**
 * Contenedor visual para listas de trámites: sombra, cabecera de tabla y cuerpo homogéneos.
 * Envuelve un <CTable> (o responsive) del proyecto.
 */
</script>

<style scoped>
.tls-root {
  width: 100%;
}

.tls-intro {
  margin-bottom: 1rem;
}

.tls-intro-text {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.55;
  padding: 0.35rem 0.15rem 0;
}

.tls-toolbar {
  margin-bottom: 1rem;
}

.tls-table-wrap {
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 4px 18px rgba(23, 111, 182, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(23, 111, 182, 0.18);
  background: #fff;
}

/* Listas CRUD (ElegantCrudList): evitar doble marco; el hijo ya trae sombra y borde */
.tls-table-wrap:has(.modern-list-wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
}

.tls-table-wrap :deep(table) {
  margin-bottom: 0;
  vertical-align: middle;
}

.tls-table-wrap :deep(thead th) {
  background:  #176fb6;
  color: #fff !important;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.75rem 0.65rem;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.25);
  white-space: nowrap;
}

.tls-table-wrap :deep(tbody td),
.tls-table-wrap :deep(tbody th) {
  padding: 0.7rem 0.65rem;
  font-size: 0.875rem;
  border-color: #e8edf3;
  vertical-align: middle;
}

.tls-table-wrap :deep(tbody tr) {
  transition: background-color 0.15s ease;
}

.tls-table-wrap :deep(tbody tr:hover) {
  background-color: rgba(23, 111, 182, 0.06) !important;
}

/* Fila expandida (historial): sin hover fuerte */
.tls-table-wrap :deep(tbody tr.table-active),
.tls-table-wrap :deep(tbody tr.bg-light) {
  background: #f4f8fc !important;
}

.tls-table-wrap :deep(.btn) {
  font-size: 0.8125rem;
  font-weight: 600;
}

.tls-table-wrap :deep(.btn-sm) {
  padding: 0.35rem 0.65rem;
}

.tls-table-wrap :deep(tbody tr.tls-expand-row:hover) {
  background-color: transparent !important;
}

.tls-table-wrap :deep(tbody tr.tls-expand-row td) {
  border-top: none;
}

.tls-table-wrap :deep(.tls-expand-inner) {
  padding: 0.75rem 1rem 1rem;
  background: linear-gradient(180deg, #f1f6fb 0%, #f8fafc 100%);
  border-top: 1px solid #e2e8f0;
}

.tls-table-wrap :deep(.tls-empty-cell) {
  padding: 2.25rem 1rem !important;
  vertical-align: middle !important;
}

.tls-table-wrap :deep(.tls-empty) {
  text-align: center;
  max-width: 440px;
  margin: 0 auto;
}

.tls-table-wrap :deep(.tls-empty__icon) {
  font-size: 1.6rem;
  display: block;
  margin-bottom: 0.4rem;
  opacity: 0.88;
}

.tls-table-wrap :deep(.tls-obs-row:hover) {
  background-color: transparent !important;
}

.tls-table-wrap :deep(.tls-obs-banner) {
  margin: 0 0.5rem 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.45);
  background: rgba(255, 243, 205, 0.95);
  color: #5c4a00;
}

.tls-table-wrap :deep(.tls-obs-label) {
  display: block;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #92400e;
  margin-bottom: 0.35rem;
}

.tls-table-wrap :deep(.tls-obs-text) {
  font-size: 0.875rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

<style>
/* Modo oscuro (CoreUI): tema por data-coreui-theme en <html> */
[data-coreui-theme='dark'] .tls-table-wrap {
  background: var(--cui-body-bg, #212631) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.45),
    0 1px 3px rgba(0, 0, 0, 0.35) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap:has(.modern-list-wrapper) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

[data-coreui-theme='dark'] .tls-table-wrap thead th {
  background: #176fb6 !important;
  color: #fff !important;
  border-bottom-color: rgba(255, 255, 255, 0.2) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap tbody td,
[data-coreui-theme='dark'] .tls-table-wrap tbody th {
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: var(--cui-body-color, #e7eaee) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap tbody tr:hover {
  background-color: rgba(23, 111, 182, 0.14) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap .tls-expand-inner {
  background: linear-gradient(180deg, rgba(23, 111, 182, 0.12) 0%, var(--cui-body-bg, #212631) 100%) !important;
  border-top-color: rgba(255, 255, 255, 0.1) !important;
}

[data-coreui-theme='dark'] .tls-intro-text {
  color: var(--cui-secondary-color, #adb5bd) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap .tls-obs-banner {
  background: rgba(255, 193, 7, 0.12) !important;
  border-color: rgba(255, 193, 7, 0.35) !important;
  color: var(--cui-body-color, #e7eaee) !important;
}

[data-coreui-theme='dark'] .tls-table-wrap .tls-obs-label {
  color: #ffc107 !important;
}
</style>

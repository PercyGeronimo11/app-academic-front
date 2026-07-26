<template>
  <div class="th-panel">
    <div class="th-panel__title">
      <span class="th-panel__icon" aria-hidden="true">▣</span>
      Historial de estados
    </div>
    <div class="th-panel__body">
      <CTable class="th-panel__table mb-0" responsive small>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="th-col-date">Fecha y hora</CTableHeaderCell>
            <CTableHeaderCell>Estado</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <template v-if="!steps || !steps.length">
            <CTableRow>
              <CTableDataCell colspan="2" class="th-empty text-center text-body-secondary small py-3">
                No hay movimientos registrados aún.
              </CTableDataCell>
            </CTableRow>
          </template>
          <template v-else>
            <CTableRow v-for="(s, i) in steps" :key="i">
              <CTableDataCell class="th-col-date text-body-secondary">{{ s.at }}</CTableDataCell>
              <CTableDataCell>
                <TramiteStatusBadge :status="s.label" :max-len="80" />
              </CTableDataCell>
            </CTableRow>
          </template>
        </CTableBody>
      </CTable>
    </div>
  </div>
</template>

<script setup>
import TramiteStatusBadge from './TramiteStatusBadge.vue';

defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.th-panel {
  border-radius: var(--rp-radius-lg);
  overflow: hidden;
  border: 1px solid var(--rp-border);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
}

.th-panel__title {
  font-weight: var(--rp-weight-semibold);
  font-size: var(--rp-text-base);
  color: var(--rp-text-heading);
  padding: var(--rp-space-3) var(--rp-space-4);
  background: var(--rp-surface-muted);
  border-bottom: 1px solid var(--rp-border-subtle);
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
}

.th-panel__icon {
  font-size: var(--rp-text-xs);
  color: var(--rp-brand-500);
}

.th-panel__body {
  padding: var(--rp-space-2) var(--rp-space-3) var(--rp-space-3);
}

.th-panel__table :deep(thead th) {
  background: var(--rp-table-head-bg);
  color: var(--rp-table-head-color);
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--rp-tracking-wide);
  border-color: var(--rp-table-head-border);
  padding: var(--rp-space-2);
}

.th-panel__table :deep(tbody td) {
  border-color: var(--rp-table-row-border);
  color: var(--rp-text);
  padding: var(--rp-space-2);
  font-size: var(--rp-text-sm);
}

.th-col-date {
  width: 38%;
  white-space: nowrap;
}

.th-empty {
  border-color: var(--rp-table-row-border);
  color: var(--rp-text-muted);
}

@media (max-width: 575.98px) {
  .th-panel__body {
    padding: var(--rp-space-2);
  }

  /* A 360px la fecha completa no cabe en una línea sin desbordar la tabla. */
  .th-col-date {
    width: 42%;
    white-space: normal;
  }
}
</style>

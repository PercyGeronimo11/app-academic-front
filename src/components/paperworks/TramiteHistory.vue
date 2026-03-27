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
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d0dce8;
  background: linear-gradient(180deg, #f8fbff 0%, #fff 48%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.th-panel__title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1a4a6e;
  padding: 0.65rem 1rem;
  background: linear-gradient(90deg, rgba(23, 111, 182, 0.12) 0%, rgba(42, 143, 216, 0.08) 100%);
  border-bottom: 1px solid #d0dce8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.th-panel__icon {
  font-size: 0.75rem;
  opacity: 0.85;
}

.th-panel__body {
  padding: 0.5rem 0.75rem 0.75rem;
}

.th-panel__table :deep(thead th) {
  background: #edf3f8 !important;
  color: #2c5282 !important;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-color: #d0dce8 !important;
  padding: 0.45rem 0.5rem;
}

.th-panel__table :deep(tbody td) {
  border-color: #e8edf3 !important;
  padding: 0.5rem 0.5rem;
  font-size: 0.8125rem;
}

.th-col-date {
  width: 38%;
  white-space: nowrap;
}

.th-empty {
  border-color: #e8edf3 !important;
}
</style>

<style>
[data-coreui-theme='dark'] .th-panel {
  border-color: rgba(255, 255, 255, 0.12) !important;
  background: var(--cui-body-bg, #212631) !important;
  box-shadow: none !important;
}

[data-coreui-theme='dark'] .th-panel__title {
  color: var(--cui-body-color, #e7eaee) !important;
  background: linear-gradient(90deg, rgba(23, 111, 182, 0.25) 0%, rgba(23, 111, 182, 0.12) 100%) !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
}

[data-coreui-theme='dark'] .th-panel__table thead th {
  background: rgba(255, 255, 255, 0.06) !important;
  color: var(--cui-body-color, #e7eaee) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-coreui-theme='dark'] .th-panel__table tbody td {
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: var(--cui-body-color, #e7eaee) !important;
}
</style>

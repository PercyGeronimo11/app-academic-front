<template>
  <div class="p-3 bg-light border rounded text-start">
    <strong>Historial de estados</strong>
    <CTable small class="mb-0 mt-2" bordered>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Fecha y hora</CTableHeaderCell>
          <CTableHeaderCell>Estado</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(s, i) in steps" :key="i">
          <CTableDataCell>{{ s.at }}</CTableDataCell>
          <CTableDataCell>{{ s.label }}</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
});
</script>

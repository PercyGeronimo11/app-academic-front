<template>
  <div class="modern-list-wrapper">
    <div v-if="!hasRows" class="modern-list-empty" role="status">
      <div class="table-empty-unified">
        <span class="table-empty-unified__icon" aria-hidden="true">{{ emptyIcon }}</span>
        <p class="table-empty-unified__title">{{ emptyMessage }}</p>
        <p v-if="emptyHint" class="table-empty-unified__hint">{{ emptyHint }}</p>
      </div>
    </div>
    <div v-else class="modern-table">
      <!-- Encabezados -->
      <div class="table-row table-header">
        <div
          v-for="column in columns"
          :key="column.key"
          :class="{ 'table-cell': true, 'center-cell': column.center||false}"
          role="columnheader"
        >
          {{ column.label }}
        </div>
      </div>

      <!-- Filas -->
      <div
        class="table-row"
        v-for="(item, index) in data"
        :key="index"
        role="row"
        tabindex="0"
        @click="onRowClick(item)"
        @keydown.enter.prevent="onRowClick(item)"
        :aria-label="getNestedValue(item, columns[0] && columns[0].key || '')"
        :class="{ 'row-selected': isSelected(item) }"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          class="table-cell"
        >
          <!-- Slot para acciones -->
          <slot
            v-if="column.key === 'actions'"
            name="actions"
            :item="item"
          />

          <!-- Slot personalizado por columna (prioridad sobre renderizados especiales) -->
          <slot
            v-else-if="$slots[column.key]"
            :name="column.key"
            :item="item"
          />

          <!-- Checkbox -->
          <input
            v-else-if="column.key === 'checkbox' && props.selectable"
            type="checkbox"
            class="checkbox"
            :checked="isSelected(item)"
            @change.prevent="toggleCheckbox(item)"
            :aria-checked="isSelected(item)"
          />

          <!-- Avatar -->
          <div
            v-else-if="column.key === 'avatar'"
            class="avatar-wrapper"
          >
            <img
              v-if="getNestedValue(item, column.key)"
              :src="getNestedValue(item, column.key)"
              alt="avatar"
              class="avatar"
              @error="(e) => { e.target.style.display='none' }"
            />
            <div v-else class="avatar-fallback">{{ getInitials(item) }}</div>
          </div>

          <!-- Estado -->
          <span
            v-else-if="column.key === 'status'"
            :class="['status-pill', statusColor(item[column.key])]">
            {{ item[column.key] }}
          </span>

          <!-- Email -->
          <a
            v-else-if="column.key === 'email'"
            :href="`mailto:${item[column.key]}`"
            class="email-link"
          >
            {{ item[column.key] }}
          </a>

          <!-- Texto plano -->
          <span v-else :class="{'center-cell': column.center||false}">
            {{ getNestedValue(item, column.key) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: 'No hay registros para mostrar.' },
  emptyHint: { type: String, default: '' },
  emptyIcon: { type: String, default: '📋' },
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' }
})

const hasRows = computed(() => Array.isArray(props.data) && props.data.length > 0)

const emit = defineEmits(['update:selected', 'row-click'])

const internalSelected = ref(new Set(props.selected || []))

watch(
  () => props.selected,
  (val) => {
    internalSelected.value = new Set(val || [])
  }
)

function toggleCheckbox(item) {
  const key = getNestedValue(item, props.rowKey)
  if (internalSelected.value.has(key)) {
    internalSelected.value.delete(key)
  } else {
    internalSelected.value.add(key)
  }
  emit('update:selected', Array.from(internalSelected.value))
}

function isSelected(item) {
  const key = getNestedValue(item, props.rowKey)
  return internalSelected.value.has(key)
}

function onRowClick(item) {
  emit('row-click', item)
}

function statusColor(status) {
  if (!status) return 'status-gray'
  const s = String(status).toLowerCase()
  switch (s) {
    case 'active':
      return 'status-green'
    case 'muted':
    case 'inactive':
      return 'status-red'
    case 'on sale':
      return 'status-blue'
    case 'bouncing':
      return 'status-purple'
    case 'pending':
      return 'status-yellow'
    default:
      return 'status-gray'
  }
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

function getInitials(item) {
  const name = item.name || item.fullName || item.title || ''
  const parts = String(name).trim().split(/\s+/)
  if (!parts.length) return ''
  return (parts[0][0] || '') + (parts[1] ? parts[1][0] : '')
}
</script>

<!--
  Los estilos de este listado viven en `src/styles/design-system/tables.css`
  (clases .modern-list-wrapper / .table-row / .table-cell) para que las tablas
  del sistema compartan un único lenguaje visual y respondan al modo oscuro.
-->


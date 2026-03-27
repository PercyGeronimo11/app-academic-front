<template>
  <div class="modern-list-wrapper">
    <div class="modern-table">
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

          <!-- Checkbox -->
          <input
            v-else-if="column.key === 'checkbox'"
            v-if="props.selectable"
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
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' }
})

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

<style scoped>
/* Misma línea visual que TramiteListShell / tablas FUT */
.modern-list-wrapper {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  color: var(--cui-body-color, #212631);
  border: 1px solid rgba(23, 111, 182, 0.18);
  box-shadow:
    0 4px 18px rgba(23, 111, 182, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

.modern-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  display: table-header-group;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 0.7rem 0.65rem;
  vertical-align: middle;
  font-size: 0.875rem;
  border-color: #e8edf3;
}

.table-header .table-cell {
  background: #176fb6;
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

.center-cell {
  text-align: center;
}

.table-row:hover {
  background-color: rgba(23, 111, 182, 0.06);
}

.modern-table {
  border: none;
}

.table-cell {
  border-right: 1px solid #e8edf3;
  border-bottom: 1px solid #e8edf3;
}

.table-cell:last-child {
  border-right: none;
}

.table-header .table-cell {
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.table-header .table-cell:last-child {
  border-right: none;
}

.checkbox {
  width: 16px;
  height: 16px;
}

.avatar-wrapper {
  display: inline-flex;
  align-items: center;
}

.avatar-wrapper .avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  font-weight: 600;
}

.email-link {
  color: #176fb6;
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

.status-pill {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #e6e9ef;
  background: transparent;
}

.status-green {
  background-color: rgba(34, 197, 94, 0.08);
  color: #065f46;
  border-color: rgba(34, 197, 94, 0.12);
}

.status-red {
  background-color: rgba(239, 68, 68, 0.06);
  color: #991b1b;
  border-color: rgba(239, 68, 68, 0.12);
}

.status-yellow {
  background-color: rgba(245, 158, 11, 0.06);
  color: #92400e;
  border-color: rgba(245, 158, 11, 0.12);
}

.status-blue {
  background-color: rgba(59, 130, 246, 0.06);
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.12);
}

.status-purple {
  background-color: rgba(124, 58, 237, 0.06);
  color: #6d28d9;
  border-color: rgba(124, 58, 237, 0.12);
}

.status-gray {
  background-color: rgba(107, 114, 128, 0.04);
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.08);
}

.row-selected {
  outline: 2px solid rgba(23, 111, 182, 0.2);
}

.table-row:focus {
  outline: 3px solid rgba(23, 111, 182, 0.15);
  outline-offset: 0;
}
</style>

<style>
[data-coreui-theme='dark'] .modern-list-wrapper {
  background: var(--cui-body-bg, #212631) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: var(--cui-body-color, #e7eaee) !important;
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.45),
    0 1px 3px rgba(0, 0, 0, 0.35) !important;
}

[data-coreui-theme='dark'] .modern-list-wrapper .table-header .table-cell {
  background: #176fb6 !important;
  color: #fff !important;
  border-bottom-color: rgba(255, 255, 255, 0.25) !important;
  border-right-color: rgba(255, 255, 255, 0.2) !important;
}

[data-coreui-theme='dark'] .modern-list-wrapper .table-cell {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-coreui-theme='dark'] .modern-list-wrapper .table-row:hover {
  background-color: rgba(23, 111, 182, 0.14) !important;
}

[data-coreui-theme='dark'] .modern-list-wrapper .email-link {
  color: #6fb8ff !important;
}

[data-coreui-theme='dark'] .modern-list-wrapper .avatar-wrapper .avatar,
[data-coreui-theme='dark'] .modern-list-wrapper .avatar-fallback {
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: var(--cui-secondary-color, #adb5bd) !important;
}
</style>

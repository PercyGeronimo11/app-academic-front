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
:root {
  --bg: #ffffff;
  --cell-bg: #ffffff;
  --cell-hover: #f7fafc;
  --header-bg: #f3f4f6;
  --text-color: #0f172a;
  --muted: #6b7280;
  --border: #e6e9ef;
  --primary: #1f6feb;
  --avatar-border: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #071016;
    --cell-bg: #07101a;
    --cell-hover: rgba(255,255,255,0.02);
    --header-bg: rgba(255,255,255,0.03);
    --text-color: #e6eef8;
    --muted: #9ca3af;
    --border: rgba(255,255,255,0.06);
    --primary: #6fb8ff;
    --avatar-border: rgba(255,255,255,0.06);
    --row-alt-bg: rgba(255,255,255,0.01);
  }
}

.modern-list-wrapper {
  padding: 0;
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg);
  color: var(--text-color);
  border: 1px solid var(--border);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* Use table layout for a formal appearance */
.modern-table { display: table; width: 100%; border-collapse: collapse }
.table-header { display: table-header-group; background: var(--header-bg); }
.table-row { display: table-row; }
.table-cell { display: table-cell; padding: 10px 12px; vertical-align: middle; font-size: 14px }

.table-header .table-cell { font-weight: 700; text-transform: uppercase; font-size: 12px; color: var(--muted); border-bottom: 2px solid var(--border) }

.center-cell { text-align: center }

.table-row:hover { background: var(--cell-hover) }

/* Visible column separators and zebra stripes for clarity */
.modern-table { border: 1px solid var(--border); }
.table-cell { border-right: 1px solid var(--border) }
.table-cell:last-child { border-right: none }
.table-row { border-bottom: none }
.table-row:nth-child(even) { background: var(--row-alt-bg, rgba(0,0,0,0.02)) }

.checkbox { width: 16px; height: 16px }

/* Avatar more formal: small square with subtle radius */
.avatar-wrapper { display: inline-flex; align-items: center }
.avatar-wrapper .avatar { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; border: 1px solid var(--avatar-border) }
.avatar-fallback { width: 32px; height: 32px; border-radius: 6px; display:inline-flex; align-items:center; justify-content:center; background: transparent; color: var(--muted); border:1px solid var(--avatar-border); font-weight:600 }

.email-link { color: var(--primary); text-decoration: none }
.email-link:hover { text-decoration: underline }

/* Status pills: subtle bordered badges */
.status-pill { padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid var(--border); background: transparent }
.status-green { background-color: rgba(34,197,94,0.08); color: #065f46; border-color: rgba(34,197,94,0.12) }
.status-red { background-color: rgba(239,68,68,0.06); color: #991b1b; border-color: rgba(239,68,68,0.12) }
.status-yellow { background-color: rgba(245,158,11,0.06); color: #92400e; border-color: rgba(245,158,11,0.12) }
.status-blue { background-color: rgba(59,130,246,0.06); color: #1d4ed8; border-color: rgba(59,130,246,0.12) }
.status-purple { background-color: rgba(124,58,237,0.06); color: #6d28d9; border-color: rgba(124,58,237,0.12) }
.status-gray { background-color: rgba(107,114,128,0.04); color: var(--muted); border-color: rgba(107,114,128,0.08) }

.row-selected { outline: 2px solid rgba(31,111,235,0.12) }

/* Focus visible for keyboard users */
.table-row:focus { outline: 3px solid rgba(31,111,235,0.12); outline-offset: 0 }

</style>

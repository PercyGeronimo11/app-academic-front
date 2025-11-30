<template>
  <div class="modern-list-wrapper">
    <div class="modern-table">
      <!-- Encabezados -->
      <div class="table-row table-header">
        <div
          v-for="column in columns"
          :key="column.key"
          :class="{ 'table-cell': true, 'center-cell': column.center||false}"
        >
          {{ column.label }}
        </div>
      </div>

      <!-- Filas -->
      <div
        class="table-row"
        v-for="(item, index) in data"
        :key="index"
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
            type="checkbox"
            class="checkbox"
          />

          <!-- Avatar -->
          <div
            v-else-if="column.key === 'avatar'"
            class="avatar-wrapper"
          >
            <img
              :src="item[column.key]"
              alt="avatar"
              class="avatar"
            />
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
            {{ item[column.key] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: Array,
  data: Array,
});

// Devuelve clase por estado
function statusColor(status) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'status-green';
    case 'muted':
    case 'inactive':
      return 'status-red';
    case 'on sale':
      return 'status-blue';
    case 'bouncing':
      return 'status-purple';
    case 'pending':
      return 'status-yellow';
    default:
      return 'status-gray';
  }
}
</script>

<style scoped>
.modern-list-wrapper {
  padding: 20px;
  /* Sin bordes redondeados en esquinas superiores */
  border-radius: 0 0 16px 16px;
  overflow-x: auto;
}

/* Tabla visual */
.modern-table {
  display: grid;
  gap: 8px;
}

/* Fila general */
.table-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  align-items: center;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.09);
  transition: 0.2s ease;
}

.table-row:hover {
  background: var(--box-content-bg-hover);
}

/* Encabezado */
.table-header {
  box-shadow: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 13px;
  cursor: default;
  border-radius: 12px 12px 12px 12px; /* Solo esquinas superiores */
}

.table-cell {
  padding: 4px 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-word;
}

.center-cell{
  justify-content: center;
}

/* Checkbox */
.checkbox {
  width: 18px;
  height: 18px;
}

/* Avatar */
.avatar-wrapper .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

/* Email */
.email-link {
  color: #2563eb;
  text-decoration: none;
}
.email-link:hover {
  text-decoration: underline;
}

/* Status pills */
.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-green {
  background-color: #d1fae5;
  color: #065f46;
}
.status-red {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-yellow {
  background-color: #fef3c7;
  color: #92400e;
}
.status-blue {
  background-color: #dbeafe;
  color: #1d4ed8;
}
.status-purple {
  background-color: #ede9fe;
  color: #6d28d9;
}
.status-gray {
  background-color: #e5e7eb;
  color: #374151;
}
</style>

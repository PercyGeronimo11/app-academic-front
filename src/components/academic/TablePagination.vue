<template>
  <div
    v-if="total > 0"
    class="modern-list-pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-2"
  >
    <small class="text-body-secondary">
      Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }}
    </small>
    <CPagination v-if="lastPage > 1" class="mb-0 flex-wrap" :aria-label="ariaLabel">
      <CPaginationItem
        href="#"
        :disabled="modelValue <= 1"
        aria-label="Anterior"
        @click.prevent="goTo(modelValue - 1)"
      >
        ‹
      </CPaginationItem>
      <CPaginationItem
        v-for="p in visiblePages"
        :key="p"
        href="#"
        :active="p === modelValue"
        @click.prevent="goTo(p)"
      >
        {{ p }}
      </CPaginationItem>
      <CPaginationItem
        href="#"
        :disabled="modelValue >= lastPage"
        aria-label="Siguiente"
        @click.prevent="goTo(modelValue + 1)"
      >
        ›
      </CPaginationItem>
    </CPagination>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Página actual (1-based) */
  modelValue: {
    type: Number,
    required: true,
  },
  /** Total de registros */
  total: {
    type: Number,
    required: true,
  },
  /** Tamaño de página */
  pageSize: {
    type: Number,
    default: 15,
  },
  /** Máximo de números de página visibles */
  maxVisible: {
    type: Number,
    default: 5,
  },
  ariaLabel: {
    type: String,
    default: 'Paginación',
  },
})

const emit = defineEmits(['update:modelValue'])

const lastPage = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize) || 1))

const rangeStart = computed(() => {
  if (props.total <= 0) return 0
  return (props.modelValue - 1) * props.pageSize + 1
})

const rangeEnd = computed(() => Math.min(props.modelValue * props.pageSize, props.total))

const visiblePages = computed(() => {
  const total = lastPage.value
  const current = props.modelValue
  const max = props.maxVisible
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = Math.max(1, current - Math.floor(max / 2))
  let end = start + max - 1
  if (end > total) {
    end = total
    start = end - max + 1
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const goTo = (page) => {
  const next = Math.min(Math.max(1, page), lastPage.value)
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
  }
}
</script>

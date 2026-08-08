import { computed, ref, unref, watch } from 'vue'

/**
 * Paginación en cliente para listas ya cargadas.
 * @param {import('vue').Ref|import('vue').ComputedRef|Array} sourceItems
 * @param {number} initialPageSize
 */
export function useClientPagination(sourceItems, initialPageSize = 15) {
  const page = ref(1)
  const pageSize = ref(initialPageSize)

  const items = computed(() => {
    const value = unref(sourceItems)
    return Array.isArray(value) ? value : []
  })

  const total = computed(() => items.value.length)

  const lastPage = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value) || 1))

  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  watch(total, () => {
    if (page.value > lastPage.value) {
      page.value = lastPage.value
    }
  })

  watch(pageSize, () => {
    page.value = 1
  })

  const setPage = (value) => {
    page.value = Math.min(Math.max(1, Number(value) || 1), lastPage.value)
  }

  return {
    page,
    pageSize,
    total,
    lastPage,
    pagedItems,
    setPage,
  }
}

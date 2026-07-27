<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>

    <div
      class="dropzone"
      :class="{ 'dropzone-active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        multiple
        :accept="accept"
        hidden
        @change="handleFiles"
      />

      <div v-if="internalItems.length === 0">
        <p>Arrastre archivos aquí o haga clic para seleccionar</p>
        <small>{{ helperText }}</small>
      </div>

      <div v-else class="file-list" @click.stop>
        <div
          v-for="(item, index) in internalItems"
          :key="item.id"
          class="file-item"
        >
          <div class="file-item__meta">
            <span class="file-item__filename" :title="item.file.name">
              <i class="fas fa-file-pdf me-1"></i>{{ item.file.name }}
            </span>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="removeFile(index)"
            >
              X
            </button>
          </div>
          <div class="file-item__name">
            <label :for="`doc-name-${item.id}`" class="form-label mb-1">
              Nombre del documento
            </label>
            <input
              :id="`doc-name-${item.id}`"
              v-model="item.name"
              type="text"
              class="form-control form-control-sm"
              maxlength="255"
              placeholder="Ej. Copia de DNI"
              required
              @click.stop
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  maxFiles: {
    type: Number,
    default: 5,
  },
  accept: {
    type: String,
    default: '.pdf,image/*',
  },
  label: {
    type: String,
    default: '',
  },
  helperText: {
    type: String,
    default: 'PDF o imágenes',
  },
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const internalItems = ref(normalizeItems(props.modelValue))
let idSeq = 0

function defaultNameFromFile(file) {
  const raw = String(file?.name || '').trim()
  if (!raw) return 'Documento anexo'
  return raw.replace(/\.[^.]+$/, '') || raw
}

function normalizeItems(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    if (item instanceof File) {
      idSeq += 1
      return { id: idSeq, file: item, name: defaultNameFromFile(item) }
    }
    idSeq += 1
    return {
      id: item.id || idSeq,
      file: item.file,
      name: item.name?.trim() || defaultNameFromFile(item.file),
    }
  }).filter((item) => item.file instanceof File)
}

watch(
  () => props.modelValue,
  (value) => {
    // Solo sincronizar desde el padre cuando limpia o reemplaza (p. ej. reset).
    if (!Array.isArray(value) || value.length === 0) {
      if (internalItems.value.length) {
        internalItems.value = []
      }
      return
    }
  }
)

watch(
  internalItems,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleDrop = (event) => {
  isDragging.value = false
  processFiles(Array.from(event.dataTransfer.files))
}

const handleFiles = (event) => {
  processFiles(Array.from(event.target.files))
  event.target.value = ''
}

const processFiles = (newFiles) => {
  if (internalItems.value.length + newFiles.length > props.maxFiles) {
    Swal.fire({
      icon: 'warning',
      title: `Máximo ${props.maxFiles} archivos`,
    })
    return
  }

  const validFiles = newFiles.filter(
    (file) => file.type.includes('pdf') || file.type.includes('image')
  )

  const next = validFiles.map((file) => {
    idSeq += 1
    return {
      id: idSeq,
      file,
      name: defaultNameFromFile(file),
    }
  })

  internalItems.value.push(...next)
}

const removeFile = (index) => {
  internalItems.value.splice(index, 1)
}
</script>

<style scoped>
.dropzone {
  border: 1px dashed var(--rp-border-brand);
  border-radius: var(--rp-radius-lg);
  padding: var(--rp-space-8) var(--rp-space-4);
  text-align: center;
  cursor: pointer;
  background-color: var(--rp-surface-muted);
  transition: border-color var(--rp-transition-fast), background-color var(--rp-transition-fast);
}

.dropzone:hover {
  border-color: var(--rp-brand-400);
  background-color: var(--rp-surface-brand-soft);
}

.dropzone-active {
  border-color: var(--rp-brand-500);
  background-color: var(--rp-surface-selected);
}

.dropzone p {
  margin: 0;
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-medium);
  color: var(--rp-text);
}

.dropzone small {
  display: block;
  margin-top: var(--rp-space-1);
  font-size: var(--rp-text-xs);
  color: var(--rp-text-muted);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  text-align: start;
  cursor: default;
}

.file-item {
  padding: var(--rp-space-3);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-md);
  background: var(--rp-surface);
}

.file-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--rp-space-2);
  margin-bottom: var(--rp-space-2);
}

.file-item__filename {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  overflow-wrap: anywhere;
}

.file-item__name .form-label {
  font-size: var(--rp-text-xs);
  color: var(--rp-text);
}

@media (max-width: 575.98px) {
  .dropzone {
    padding: var(--rp-space-5) var(--rp-space-3);
  }
}
</style>

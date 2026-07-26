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

      <div v-if="internalFiles.length === 0">
        <p>Arrastre archivos aquí o haga clic para seleccionar</p>
        <small>{{ helperText }}</small>
      </div>

      <div v-else>
        <ul class="list-group">
          <li
            v-for="(file, index) in internalFiles"
            :key="index"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            {{ file.name }}
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click.stop="removeFile(index)"
            >
              X
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxFiles: {
    type: Number,
    default: 5
  },
  accept: {
    type: String,
    default: '.pdf,image/*'
  },
  label: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: 'PDF o imágenes'
  }
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const isDragging = ref(false);
const internalFiles = ref([...props.modelValue]);

watch(internalFiles, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleDrop = (event) => {
  isDragging.value = false;
  processFiles(Array.from(event.dataTransfer.files));
};

const handleFiles = (event) => {
  processFiles(Array.from(event.target.files));
};

const processFiles = (newFiles) => {

  if (internalFiles.value.length + newFiles.length > props.maxFiles) {
    Swal.fire({
      icon: 'warning',
      title: `Máximo ${props.maxFiles} archivos`
    });
    return;
  }

  const validFiles = newFiles.filter(file =>
    file.type.includes('pdf') || file.type.includes('image')
  );

  internalFiles.value.push(...validFiles);
};

const removeFile = (index) => {
  internalFiles.value.splice(index, 1);
};
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

.dropzone .list-group {
  text-align: start;
}

.dropzone .list-group-item {
  gap: var(--rp-space-2);
  font-size: var(--rp-text-base);
  color: var(--rp-text);
  background: var(--rp-surface);
  border-color: var(--rp-border);
  overflow-wrap: anywhere;
}

@media (max-width: 575.98px) {
  .dropzone {
    padding: var(--rp-space-5) var(--rp-space-3);
  }
}
</style>
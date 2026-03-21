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
  border: 2px dashed #6c757d;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.dropzone:hover {
  background-color: #e9ecef;
}

.dropzone-active {
  border-color: #321fdb;
  background-color: #e7e6ff;
}
</style>
<template>
  <div class="rich-editor" :class="{ 'rich-editor--focus': focused }">
    <QuillEditor
      ref="quillRef"
      v-model:content="innerHtml"
      content-type="html"
      theme="snow"
      :toolbar="toolbarOptions"
      :placeholder="placeholder"
      @focus="focused = true"
      @blur="focused = false"
      @update:content="onUpdate"
    />

    <div class="rich-editor__emoji-bar">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        class="rich-editor__emoji-btn"
        :title="`Insertar ${emoji}`"
        @click="insertEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Escriba el contenido...',
  },
})

const emit = defineEmits(['update:modelValue'])

const quillRef = ref(null)
const focused = ref(false)

const innerHtml = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value || ''),
})

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'link'],
  ['clean'],
]

const emojis = [
  '😀', '😁', '😊', '😉', '😍', '🤔', '👍', '👏',
  '🙌', '🎉', '📢', '📌', '✅', '⚠️', '❗', '📚',
  '🏫', '📝', '🗓️', '⏰', '💡', '❤️', '⭐', '🙏',
]

const onUpdate = (value) => {
  emit('update:modelValue', value || '')
}

const insertEmoji = (emoji) => {
  const editor = quillRef.value?.getQuill?.()
  if (!editor) {
    emit('update:modelValue', `${props.modelValue || ''}${emoji}`)
    return
  }

  const range = editor.getSelection(true)
  const index = range ? range.index : editor.getLength()
  editor.insertText(index, emoji, 'user')
  editor.setSelection(index + emoji.length, 0, 'user')
  editor.focus()
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  overflow: hidden;
  background: var(--rp-surface);
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.rich-editor--focus {
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.rich-editor :deep(.ql-toolbar.ql-snow) {
  border: 0;
  border-bottom: 1px solid var(--rp-border-subtle);
  background: var(--rp-surface-muted);
  padding: var(--rp-space-2);
}

.rich-editor :deep(.ql-container.ql-snow) {
  border: 0;
  min-height: 10rem;
  font-size: var(--rp-text-base);
  color: var(--rp-text);
}

.rich-editor :deep(.ql-editor) {
  min-height: 10rem;
}

.rich-editor :deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: var(--rp-text-subtle);
}

/* Quill dibuja los iconos con stroke/fill fijos; hay que redirigirlos a los
   tokens para que la barra siga al tema. */
.rich-editor :deep(.ql-snow .ql-stroke) {
  stroke: var(--rp-text-muted);
}

.rich-editor :deep(.ql-snow .ql-fill) {
  fill: var(--rp-text-muted);
}

.rich-editor :deep(.ql-snow .ql-picker) {
  color: var(--rp-text-muted);
}

.rich-editor :deep(.ql-snow .ql-picker-options) {
  background: var(--rp-surface);
  border-color: var(--rp-border);
  border-radius: var(--rp-radius-sm);
  box-shadow: var(--rp-shadow-md);
}

.rich-editor :deep(.ql-snow button:hover .ql-stroke),
.rich-editor :deep(.ql-snow button.ql-active .ql-stroke),
.rich-editor :deep(.ql-snow .ql-picker-label:hover .ql-stroke) {
  stroke: var(--rp-brand-500);
}

.rich-editor :deep(.ql-snow button:hover .ql-fill),
.rich-editor :deep(.ql-snow button.ql-active .ql-fill) {
  fill: var(--rp-brand-500);
}

.rich-editor :deep(.ql-snow button:hover),
.rich-editor :deep(.ql-snow .ql-picker-label:hover),
.rich-editor :deep(.ql-snow .ql-picker-item:hover) {
  color: var(--rp-brand-500);
}

.rich-editor :deep(.ql-snow blockquote) {
  border-left: 3px solid var(--rp-border-strong);
  color: var(--rp-text-muted);
}

.rich-editor :deep(.ql-snow a) {
  color: var(--rp-brand-500);
}

.rich-editor__emoji-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rp-space-1);
  padding: var(--rp-space-2);
  border-top: 1px solid var(--rp-border-subtle);
  background: var(--rp-surface-muted);
}

.rich-editor__emoji-btn {
  border: 0;
  background: transparent;
  border-radius: var(--rp-radius-sm);
  width: 1.9rem;
  height: 1.9rem;
  line-height: 1;
  font-size: var(--rp-text-lg);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast);
}

.rich-editor__emoji-btn:hover {
  background: var(--rp-surface-hover);
}

.rich-editor__emoji-btn:focus-visible {
  outline: none;
  box-shadow: var(--rp-shadow-focus);
}

@media (max-width: 575.98px) {
  .rich-editor :deep(.ql-container.ql-snow),
  .rich-editor :deep(.ql-editor) {
    min-height: 8rem;
  }

  .rich-editor__emoji-bar {
    gap: 0.125rem;
    padding: var(--rp-space-1);
  }
}
</style>

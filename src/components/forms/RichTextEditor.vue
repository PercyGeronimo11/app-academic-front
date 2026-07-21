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
  border: 1px solid #ced4da;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
}

.rich-editor--focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.rich-editor :deep(.ql-toolbar.ql-snow) {
  border: 0;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.rich-editor :deep(.ql-container.ql-snow) {
  border: 0;
  min-height: 160px;
  font-size: 0.95rem;
}

.rich-editor :deep(.ql-editor) {
  min-height: 160px;
}

.rich-editor :deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: #94a3b8;
}

.rich-editor__emoji-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.45rem 0.55rem;
  border-top: 1px solid #e5e7eb;
  background: #fafbfc;
}

.rich-editor__emoji-btn {
  border: 0;
  background: transparent;
  border-radius: 6px;
  width: 1.9rem;
  height: 1.9rem;
  line-height: 1;
  font-size: 1.05rem;
  cursor: pointer;
}

.rich-editor__emoji-btn:hover {
  background: #e8eef7;
}
</style>

<template>
  <div class="assistant-page">
    <div class="assistant-shell">
      <header class="assistant-header">
        <div class="assistant-brand">
          <div class="assistant-avatar">
            <i class="fas fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h1>Asistente Inteligente</h1>
            <p>Consultas sobre asistencias, notas, trámites y riesgo académico</p>
          </div>
        </div>
      </header>

      <section ref="messagesContainer" class="assistant-messages">
        <div v-if="!messages.length" class="assistant-empty">
          <i class="fas fa-comments"></i>
          <h3>¿En qué puedo ayudarte?</h3>
          <p>
            Ejemplos: "¿Quién faltó hoy?", "Alumnos de 3°A con muchas faltas y riesgo alto",
            "Trámites pendientes"
          </p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-row"
          :class="message.role"
        >
          <div class="message-bubble" v-html="message.html"></div>
        </div>

        <div v-if="thinkingText" class="message-row assistant">
          <div class="message-bubble thinking-bubble">
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-dot"></span>
            <span class="thinking-label">{{ thinkingText }}</span>
          </div>
        </div>
      </section>

      <footer class="assistant-input">
        <textarea
          v-model="prompt"
          rows="1"
          placeholder="Escribe tu consulta..."
          :disabled="isStreaming"
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <button type="button" :disabled="isStreaming || !prompt.trim()" @click="sendMessage">
          <i v-if="!isStreaming" class="fas fa-paper-plane"></i>
          <span v-else class="spinner-border spinner-border-sm"></span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { marked } from 'marked'

import AsistenteService from '@/services/AsistenteService'

const prompt = ref('')
const messages = ref([])
const messagesContainer = ref(null)
const conversationId = ref(null)
const isStreaming = ref(false)
const thinkingText = ref('')
const streamingBuffer = ref('')

marked.setOptions({ breaks: true })

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const appendMessage = async (role, text) => {
  messages.value.push({
    role,
    html: role === 'user' ? text : marked.parse(text || ''),
  })
  await scrollToBottom()
}

const updateStreamingMessage = async (text) => {
  const last = messages.value[messages.value.length - 1]
  if (!last || last.role !== 'assistant-live') {
    messages.value.push({ role: 'assistant-live', html: marked.parse(text) })
  } else {
    last.html = marked.parse(text)
  }
  await scrollToBottom()
}

const finalizeStreamingMessage = () => {
  const last = messages.value[messages.value.length - 1]
  if (last?.role === 'assistant-live') {
    last.role = 'assistant'
  }
}

onMounted(async () => {
  try {
    const response = await AsistenteService.createConversation()
    conversationId.value = response?.data?.conversation_id ?? null
  } catch (error) {
    console.error('No se pudo crear la conversación', error)
  }
})

const sendMessage = async () => {
  const text = prompt.value.trim()
  if (!text || isStreaming.value) return

  prompt.value = ''
  thinkingText.value = 'Pensando...'
  isStreaming.value = true
  streamingBuffer.value = ''

  await appendMessage('user', text)

  try {
    await AsistenteService.chatStream({
      prompt: text,
      conversationId: conversationId.value,
      onThinking: (value) => {
        thinkingText.value = value || 'Pensando...'
      },
      onToken: async (token) => {
        thinkingText.value = ''
        streamingBuffer.value += token
        await updateStreamingMessage(streamingBuffer.value)
      },
      onDone: (meta) => {
        if (meta?.conversation_id) {
          conversationId.value = meta.conversation_id
        }
        finalizeStreamingMessage()
      },
      onError: async (error) => {
        thinkingText.value = ''
        await appendMessage('assistant', `Ocurrió un error: ${error}`)
      },
    })
  } catch (error) {
    thinkingText.value = ''
    await appendMessage('assistant', 'No se pudo conectar con el Asistente Inteligente.')
  } finally {
    thinkingText.value = ''
    isStreaming.value = false
    finalizeStreamingMessage()
  }
}
</script>

<style scoped>
.assistant-page {
  min-height: calc(100vh - 8rem);
  display: flex;
  justify-content: center;
  padding: var(--rp-space-4) 0 var(--rp-space-8);
}

.assistant-shell {
  width: 100%;
  max-width: min(100%, 57.5rem);
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  box-shadow: var(--rp-shadow-xs);
  overflow: hidden;
}

.assistant-header {
  padding: var(--rp-space-4) var(--rp-space-5);
  background: var(--rp-surface-muted);
  border-bottom: 1px solid var(--rp-border-subtle);
}

.assistant-brand {
  display: flex;
  gap: var(--rp-space-3);
  align-items: center;
}

.assistant-avatar {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: var(--rp-radius-md);
  display: grid;
  place-items: center;
  background: var(--rp-surface-brand-soft);
  color: var(--rp-brand-500);
  font-size: var(--rp-text-md);
}

.assistant-brand h1 {
  margin: 0;
  font-size: var(--rp-text-xl);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  color: var(--rp-text-heading);
}

.assistant-brand p {
  margin: var(--rp-space-1) 0 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-base);
  line-height: var(--rp-leading-snug);
}

.assistant-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--rp-space-5);
  background: var(--rp-surface);
}

.assistant-empty {
  text-align: center;
  color: var(--rp-text-muted);
  padding: var(--rp-space-10) var(--rp-space-4);
}

.assistant-empty i {
  font-size: 1.75rem;
  color: var(--rp-brand-500);
  margin-bottom: var(--rp-space-3);
}

.assistant-empty h3 {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.assistant-empty p {
  margin: 0;
  font-size: var(--rp-text-base);
}

.message-row {
  display: flex;
  margin-bottom: var(--rp-space-3);
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant,
.message-row.assistant-live {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 88%;
  padding: var(--rp-space-3) var(--rp-space-4);
  border: 1px solid transparent;
  border-radius: var(--rp-radius-lg);
  line-height: var(--rp-leading-normal);
  font-size: var(--rp-text-base);
  overflow-wrap: break-word;
}

.message-row.user .message-bubble {
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  border-end-end-radius: var(--rp-radius-xs);
}

.message-row.assistant .message-bubble,
.message-row.assistant-live .message-bubble {
  background: var(--rp-surface-muted);
  border-color: var(--rp-border-subtle);
  color: var(--rp-text);
  border-end-start-radius: var(--rp-radius-xs);
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: var(--rp-space-1);
}

.thinking-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-brand-500);
  animation: pulse 1.2s infinite ease-in-out;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.3s;
}

.thinking-label {
  margin-left: var(--rp-space-1);
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
}

.assistant-input {
  display: flex;
  gap: var(--rp-space-2);
  padding: var(--rp-space-4);
  border-top: 1px solid var(--rp-border-subtle);
  background: var(--rp-surface);
}

.assistant-input textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  color: var(--rp-text);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  padding: var(--rp-space-3) var(--rp-space-4);
  min-height: 2.75rem;
  max-height: 8.75rem;
  font-size: var(--rp-text-base);
  outline: none;
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.assistant-input textarea::placeholder {
  color: var(--rp-text-subtle);
}

.assistant-input textarea:focus {
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.assistant-input button {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border: 1px solid var(--rp-brand-500);
  border-radius: var(--rp-radius-md);
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  transition: background-color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.assistant-input button:hover:not(:disabled) {
  background: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

.assistant-input button:disabled {
  background: var(--rp-surface-sunken);
  border-color: var(--rp-border);
  color: var(--rp-text-subtle);
  cursor: not-allowed;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 575.98px) {
  .assistant-page {
    padding: var(--rp-space-3) 0 var(--rp-space-6);
  }

  .assistant-header,
  .assistant-messages,
  .assistant-input {
    padding: var(--rp-space-3);
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>

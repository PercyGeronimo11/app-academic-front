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
          <p>Ejemplos: "¿Quién faltó hoy?", "Alumnos desaprobados en 3-A", "Trámites pendientes"</p>
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
  padding: 1rem 0 2rem;
}

.assistant-shell {
  width: 100%;
  max-width: 920px;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 114, 255, 0.08);
}

.assistant-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 114, 255, 0.08), rgba(0, 198, 255, 0.08));
  border-bottom: 1px solid rgba(0, 114, 255, 0.08);
}

.assistant-brand {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.assistant-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0072ff, #00c6ff);
  color: #fff;
  font-size: 1.2rem;
}

.assistant-brand h1 {
  margin: 0;
  font-size: 1.35rem;
  color: #0f172a;
}

.assistant-brand p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.92rem;
}

.assistant-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.assistant-empty {
  text-align: center;
  color: #64748b;
  padding: 3rem 1rem;
}

.assistant-empty i {
  font-size: 2rem;
  color: #0072ff;
  margin-bottom: 0.75rem;
}

.message-row {
  display: flex;
  margin-bottom: 1rem;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant,
.message-row.assistant-live {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 82%;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  line-height: 1.55;
  font-size: 0.96rem;
}

.message-row.user .message-bubble {
  background: #0072ff;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message-row.assistant .message-bubble,
.message-row.assistant-live .message-bubble {
  background: #f1f5f9;
  color: #0f172a;
  border-bottom-left-radius: 6px;
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.thinking-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0072ff;
  animation: pulse 1.2s infinite ease-in-out;
}

.thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.thinking-dot:nth-child(3) { animation-delay: 0.3s; }

.thinking-label {
  margin-left: 0.35rem;
  color: #64748b;
  font-size: 0.9rem;
}

.assistant-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

.assistant-input textarea {
  flex: 1;
  resize: none;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  min-height: 48px;
  max-height: 140px;
  outline: none;
}

.assistant-input textarea:focus {
  border-color: #0072ff;
  box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.12);
}

.assistant-input button {
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 14px;
  background: #0072ff;
  color: #fff;
}

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>

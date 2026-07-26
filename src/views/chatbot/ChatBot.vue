<template>
  <div class="chatbot-container">
    <div class="chat-header">
      <h3>Chatbot</h3>
      <i class="fas fa-robot icon-robot"></i>
    </div>

    <!-- Mensajes del Chat -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(message, index) in chatMessages"
        :key="index"
        :class="[
          'message',
          message.type === 'user' ? 'user-message' : 'bot-message',
          message.type === 'error' ? 'error-message' : '',
        ]"
      >
        <div v-html="message.text"></div>
      </div>
    </div>

    <!-- Campo de Entrada del Usuario -->
    <div class="chat-input">
      <input
        type="text"
        v-model="userMessage"
        placeholder="Escribe un mensaje..."
        class="input-message"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage" :disabled="isSending" class="send-button">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ChatbotService from "../../services/ChatbotService";
import { marked } from "marked";

const userMessage = ref("");
const chatMessages = ref([]);
const isSending = ref(false);
const messagesContainer = ref(null);

const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  chatMessages.value.push({ text: userMessage.value, type: "user" });
  const prompt = userMessage.value;
  userMessage.value = "";

  await nextTick();
  scrollToBottom();

  try {
    isSending.value = true;
    const data = { prompt };
    const response = await ChatbotService.sentPromptService(data);
    const botMessage = marked(response.data.response);

    chatMessages.value.push({ text: botMessage, type: "bot" });
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    chatMessages.value.push({
      text: "Error al enviar el mensaje. Inténtalo de nuevo.",
      type: "error",
    });
  } finally {
    isSending.value = false;
  }
};

const scrollToBottom = () => {
  const container = messagesContainer.value;
  container.scrollTop = container.scrollHeight;
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chatbot-container {
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  box-shadow: var(--rp-shadow-xs);
  max-width: min(100%, 60rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: clamp(24rem, calc(100vh - 12rem), 34rem);
}

.chat-header {
  background-color: var(--rp-surface-muted);
  color: var(--rp-text-heading);
  border-bottom: 1px solid var(--rp-border-subtle);
  padding: var(--rp-space-3) var(--rp-space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rp-space-3);
}

.chat-header h3 {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  margin: 0;
}

.icon-robot {
  font-size: var(--rp-text-xl);
  color: var(--rp-brand-500);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--rp-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
  scroll-behavior: smooth;
}

.message {
  padding: var(--rp-space-3) var(--rp-space-4);
  border: 1px solid transparent;
  border-radius: var(--rp-radius-lg);
  max-width: min(100%, 42rem);
  font-size: var(--rp-text-base);
  line-height: var(--rp-leading-normal);
  overflow-wrap: break-word;
}

.user-message {
  background-color: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  border-end-end-radius: var(--rp-radius-xs);
  margin-left: auto;
}

.bot-message {
  background-color: var(--rp-surface-muted);
  border-color: var(--rp-border-subtle);
  color: var(--rp-text);
  border-end-start-radius: var(--rp-radius-xs);
  margin-right: auto;
}

.error-message {
  background-color: var(--rp-danger-50);
  border-color: var(--rp-danger-200);
  color: var(--rp-danger-800);
}

.chat-input {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  padding: var(--rp-space-3) var(--rp-space-4);
  border-top: 1px solid var(--rp-border-subtle);
  background-color: var(--rp-surface);
}

.input-message {
  flex: 1;
  min-width: 0;
  color: var(--rp-text);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border-strong);
  border-radius: var(--rp-radius-md);
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-base);
  outline: none;
  transition: border-color var(--rp-transition-fast), box-shadow var(--rp-transition-fast);
}

.input-message::placeholder {
  color: var(--rp-text-subtle);
}

.input-message:focus {
  border-color: var(--rp-brand-400);
  box-shadow: var(--rp-shadow-focus);
}

.send-button {
  background-color: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  border: 1px solid var(--rp-brand-500);
  border-radius: var(--rp-radius-md);
  padding: var(--rp-space-2) var(--rp-space-4);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.send-button:hover:not(:disabled) {
  background-color: var(--rp-brand-600);
  border-color: var(--rp-brand-600);
}

.send-button:disabled {
  background-color: var(--rp-surface-sunken);
  border-color: var(--rp-border);
  color: var(--rp-text-subtle);
  cursor: not-allowed;
}

@media (max-width: 575.98px) {
  .chat-header,
  .chat-messages,
  .chat-input {
    padding: var(--rp-space-3);
  }
}
</style>

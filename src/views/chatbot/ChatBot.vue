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
  background: linear-gradient(to right, #ebf8ff, #d0f0fd);
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 96rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 34rem;
}

.chat-header {
  background-color: #34d399;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 1rem;
  padding-right: 1rem;
}

.chat-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.icon-robot {
  font-size: 1.5rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scroll-behavior: smooth;
}

.message {
  padding: 0.75rem;
  border-radius: 0.5rem;
  max-width: 48rem;
  font-size: 0.875rem;
  line-height: 1.25;
  transition: all 0.3s;
}

.user-message {
  background-color: #bbf7d0;
  margin-left: auto;
}

.bot-message {
  background-color: #e5e7eb;
  margin-right: auto;
}

.error-message {
  background-color: #fecaca;
  color: #991b1b;
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #fff;
}

.input-message {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-right: 0.5rem;
  outline: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.input-message:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.send-button {
  background-color: #34d399;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.send-button:hover {
  background-color: #2a9f82;
}

.send-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
</style>

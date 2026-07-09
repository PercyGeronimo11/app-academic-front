const API_URL = import.meta.env.VITE_API_URL_DJANGO

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const parseSseChunk = (buffer, onEvent) => {
  const parts = buffer.split('\n\n')
  const remainder = parts.pop() || ''

  for (const part of parts) {
    const line = part.trim()
    if (!line.startsWith('data:')) continue
    try {
      const payload = JSON.parse(line.slice(5).trim())
      onEvent(payload)
    } catch {
      // ignore malformed chunks
    }
  }

  return remainder
}

export default {
  createConversation() {
    return fetch(`${API_URL}/chatbot-ia/conversations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then((r) => r.json())
  },

  chatSync({ prompt, conversationId = null }) {
    return fetch(`${API_URL}/chatbot-ia/chat/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
        conversation_id: conversationId,
      }),
    }).then((r) => r.json())
  },

  async chatStream({ prompt, conversationId = null, onThinking, onToken, onDone, onError }) {
    const response = await fetch(`${API_URL}/chatbot-ia/stream/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
        conversation_id: conversationId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      onError?.(error || 'Error en el streaming')
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError?.('Streaming no soportado en este navegador')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      buffer = parseSseChunk(buffer, (event) => {
        if (event.event === 'thinking') onThinking?.(event.data)
        if (event.event === 'token') onToken?.(event.data)
        if (event.event === 'done') {
          try {
            onDone?.(JSON.parse(event.data))
          } catch {
            onDone?.({})
          }
        }
        if (event.event === 'error') onError?.(event.data)
      })
    }
  },
}

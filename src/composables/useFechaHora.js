import { ref, onMounted, onUnmounted } from 'vue'

export function useFechaHora() {
  const fechaHora = ref('')
  let interval = null

  const actualizarFechaHora = () => {
    const ahora = new Date()

    const fecha = ahora.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const hora = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    fechaHora.value = `${fecha} ${hora}`
  }

  onMounted(() => {
    actualizarFechaHora()
    interval = setInterval(actualizarFechaHora, 1000)
  })

  onUnmounted(() => {
    clearInterval(interval)
  })

  return {
    fechaHora
  }
}
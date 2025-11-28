<template>
  <div class="scanner-container">
    <video id="video" class="scanner-video"></video>
    <p v-if="dniDetectado">🧾 DNI detectado: {{ dniDetectado }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import AssistanceService from "@/services/AssistanceService";


const dniDetectado = ref('')
let codeReader = null
let stream = null

onMounted(async () => {
  try {
    console.log('🎥 Iniciando cámara...')
    codeReader = new BrowserQRCodeReader()

    const videoElement = document.getElementById('video')
    const devices = await BrowserQRCodeReader.listVideoInputDevices()

    if (devices.length === 0) {
      alert('No se encontró cámara.')
      return
    }

    const selectedDeviceId = devices[0].deviceId

    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedDeviceId },
    })
    videoElement.srcObject = stream
    videoElement.play()

    // Detectar continuamente
    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', async (result, err) => {
      if (result) {
        const dni = result.text.trim()
        console.log('✅ QR detectado:', dni)
        if (dni !== dniDetectado.value) {
          dniDetectado.value = dni
          await registrarAsistencia(dni)
        }
      } 

       if (err && err.name !== 'NotFoundException') {
        // console.error('Error al decodificar el QR:')
      }
      
    })
  } catch (error) {
    console.error('❌ Error al iniciar cámara:', error)
  }
})

onBeforeUnmount(() => {
  if (codeReader) codeReader.reset()
  if (stream) stream.getTracks().forEach(track => track.stop())
})

// === Función para registrar asistencia ===
async function registrarAsistencia(dni) {
  try {
    console.log(`📤 Enviando DNI ${dni} a la API...`)
    const response = await AssistanceService.registrarAsistenciaAuxiliar(dni)
    console.log('✅ Asistencia registrada:', response.data)
  } catch (error) {
    console.error('❌ Error al registrar asistencia:', error)
  }
}
</script>

<style scoped>
.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.scanner-video {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}
</style>

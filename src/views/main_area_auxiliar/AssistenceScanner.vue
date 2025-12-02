<template>
  <div class="scanner-container">
    <video id="video" class="scanner-video"></video>

    <p v-if="dniDetectado" class="fw-bold text-primary mt-2">
      🧾 DNI detectado: {{ dniDetectado }}
    </p>

    <div class="d-flex gap-2 mt-3">
      <CButton color="primary" @click="empezarScan" :disabled="scanning">
        Empezar escaneo
      </CButton>
      <CButton color="danger" @click="apagarCamara" :disabled="!scanning">
        Apagar cámara
      </CButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import AssistanceService from "@/services/AssistanceService";
import Swal from 'sweetalert2'

const dniDetectado = ref('')
const scanning = ref(false)
let codeReader = null
let stream = null
let selectedDeviceId = null
let decodeControl = null



// === Función para iniciar la cámara y escaneo ===
async function empezarScan() {
  if (scanning.value) return
  scanning.value = true

  try {
    codeReader = new BrowserQRCodeReader()
    const videoElement = document.getElementById('video')
    const devices = await BrowserQRCodeReader.listVideoInputDevices()

    if (devices.length === 0) {
      Swal.fire('Error', 'No se encontró cámara.', 'error')
      scanning.value = false
      return
    }

    let backCamera = devices.find(d =>
      d.label.toLowerCase().includes("back") ||
      d.label.toLowerCase().includes("environment")
    )

    // Si no hay etiqueta, usar la segunda cámara
    if (!backCamera && devices.length > 1) {
      backCamera = devices[1]
    }

    selectedDeviceId = backCamera ? backCamera.deviceId : devices[0].deviceId

    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedDeviceId },
      // video: { facingMode: 'environment' }
    })
    videoElement.srcObject = stream
    videoElement.play()

    // Mantener la lógica original de detección continua
    decodeControl = codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', async (result, err) => {
      if (result) {
        const dni = result.text.trim()
        if (dni !== dniDetectado.value) {
          dniDetectado.value = dni
          console.log('✅ DNI detectado:', dni)
          await registrarAsistencia(dni)
        }
      }

      else if (err && !err.name.startsWith('NotFoundException') && !err.name.startsWith('ChecksumException')) {
        // Solo mostrar errores realmente inesperados
        console.error('❌ Error durante el escaneo:', err)
      }

    })
  } catch (error) {
    console.error('❌ Error al iniciar cámara:', error)
    Swal.fire('Error', 'No se pudo iniciar la cámara.', 'error')
    scanning.value = false
  }
}

// === Función para apagar la cámara ===
function apagarCamara() {
  if (decodeControl && typeof decodeControl.stop === 'function') {
    decodeControl.stop()
    decodeControl = null
    console.log('🔹 Escaneo detenido')
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
    console.log('🔹 Cámara detenida y stream liberado');
  }

  const videoElement = document.getElementById('video')
  if (videoElement) {
    videoElement.srcObject = null
    // opcional: poner fondo negro
    videoElement.style.backgroundColor = 'black'
  }

  scanning.value = false
  dniDetectado.value = ''
  console.log('🔹 DNI detectado reseteado');
}

// === Función para registrar asistencia ===
async function registrarAsistencia(dni) {
  try {
    const response = await AssistanceService.registrarAsistenciaAuxiliar(dni)
    Swal.fire({
      icon: 'success',
      title: 'Asistencia registrada',
      text: `Usuario con DNI ${dni} registrado correctamente.`,
      confirmButtonText: 'Aceptar'
    })
  } catch (error) {
    console.error('❌ Error al registrar asistencia:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo registrar la asistencia.',
      confirmButtonText: 'Aceptar'
    })
  }
}

onBeforeUnmount(() => {
  apagarCamara()
})
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
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>

<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-primary d-flex align-items-center justify-content-between">
          <div class="fw-bold text-white">
            <i class="fas fa-qrcode me-2"></i>
            Escáner de asistencia
          </div>
          <CBadge color="success" v-if="scanning">
            <i class="fas fa-circle me-1"></i> Activo
          </CBadge>
          <CBadge color="danger" v-else>Inactivo</CBadge>
        </CCardHeader>

        <CCardBody class="text-center">
          <div class="scanner-wrapper mb-3">
            <video ref="videoRef" class="scanner-video" playsinline muted></video>
            <div v-if="scanning" class="scanner-line"></div>
          </div>

          <div v-if="lastResult" class="mt-3">
            <CBadge :color="lastResult.ok ? 'success' : 'warning'" class="px-3 py-2 fs-6 text-wrap">
              {{ lastResult.text }}
            </CBadge>
          </div>
          <div v-else-if="codeStudentDetectado" class="mt-3">
            <CBadge color="info" class="px-3 py-2 fs-6">
              <i class="fas fa-id-card me-2"></i>
              Código: {{ codeStudentDetectado }}
            </CBadge>
          </div>

          <div class="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3 mt-4">
            <CButton color="primary" size="md" class="w-100 w-sm-auto" @click="empezarScan" :disabled="scanning">
              <i class="fas fa-camera me-2"></i>
              Iniciar escaneo
            </CButton>
            <CButton
              color="danger"
              size="md"
              variant="outline"
              class="w-100 w-sm-auto"
              @click="apagarCamara"
              :disabled="!scanning"
            >
              <i class="fas fa-power-off me-2"></i>
              Apagar cámara
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

</template>

<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import AssistanceService from '@/services/AssistanceService'
import { toastSuccess, toastError } from '@/utils/alerts'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const codeStudentDetectado = ref(null)
const lastResult = ref(null)
const scanning = ref(false)
const registering = ref(false)
let codeReader = null
let stream = null
let selectedDeviceId = null
let decodeControl = null
let lastScanAt = 0
const SCAN_COOLDOWN_MS = 2500

const asistenciasHoy = ref(0)
const totalAlumnos = ref(0)
const videoRef = ref(null)

const loadTotalAsistencias = async () => {
  try {
    const res = await AssistanceService.VAuxiliar_totalesAsistencias()
    asistenciasHoy.value = res.data.asistencias_hoy
    totalAlumnos.value = res.data.total_alumnos
  } catch (error) {
    console.log('Error al cargar totales de asistencias:', error)
  }
}

async function empezarScan() {
  if (scanning.value) return
  scanning.value = true
  lastResult.value = null

  try {
    codeReader = new BrowserQRCodeReader()
    const devices = await BrowserQRCodeReader.listVideoInputDevices()

    if (devices.length === 0) {
      toastError('No se encontró cámara')
      scanning.value = false
      return
    }

    let backCamera = devices.find((d) => {
      const label = (d.label || '').toLowerCase()
      return label.includes('back') || label.includes('environment') || label.includes('trasera')
    })

    if (!backCamera && devices.length > 1) {
      backCamera = devices[1]
    }

    selectedDeviceId = backCamera ? backCamera.deviceId : devices[0].deviceId

    const constraints = {
      video: selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId }, facingMode: { ideal: 'environment' } }
        : { facingMode: { ideal: 'environment' } },
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
    }

    videoRef.value.srcObject = stream
    await videoRef.value.play()

    decodeControl = codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.value, async (result, err) => {
      if (result) {
        const student_code = result.text.trim()
        const now = Date.now()
        if (registering.value) return
        if (student_code === codeStudentDetectado.value && now - lastScanAt < SCAN_COOLDOWN_MS) {
          return
        }
        codeStudentDetectado.value = student_code
        lastScanAt = now
        await registrarAsistencia(student_code)
        return
      }

      if (err && !err.name?.startsWith('NotFoundException') && !err.name?.startsWith('ChecksumException')) {
        console.error('Error durante el escaneo:', err)
      }
    })
  } catch (error) {
    console.error('Error al iniciar cámara:', error)
    toastError('No se pudo iniciar la cámara. Use HTTPS o permita el acceso.')
    scanning.value = false
  }
}

function apagarCamara() {
  if (decodeControl && typeof decodeControl.stop === 'function') {
    decodeControl.stop()
    decodeControl = null
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  scanning.value = false
  codeStudentDetectado.value = null
}

async function registrarAsistencia(student_code) {
  registering.value = true
  try {
    const res = await AssistanceService.VAuxiliar_registrarAsistencia(student_code)
    const mensaje = res.data?.mensaje || 'Asistencia registrada'
    const estado = res.data?.estado ? ` (${res.data.estado})` : ''
    lastResult.value = { ok: true, text: `${mensaje}${estado}` }
    toastSuccess(`${mensaje}${estado}`)
    await loadTotalAsistencias()
  } catch (error) {
    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      `No se pudo registrar: ${student_code}`
    lastResult.value = { ok: false, text: mensaje }
    toastError(mensaje)
  } finally {
    registering.value = false
  }
}

onBeforeUnmount(() => {
  apagarCamara()
})

onMounted(() => {
  loadTotalAsistencias()
})
</script>

<style scoped>
.scanner-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px dashed var(--rp-border-strong);
  /* Negro fijo: es el fondo del visor de cámara, no una superficie del tema. */
  background: #000;
  max-width: 520px;
  margin: 0 auto;
}

.scanner-video {
  width: 100%;
  height: min(55vh, 420px);
  object-fit: cover;
}

.scanner-line {
  position: absolute;
  width: 100%;
  height: 3px;
  background: var(--rp-success-500);
  top: 0;
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% {
    top: 0;
  }
  50% {
    top: 95%;
  }
  100% {
    top: 0;
  }
}

@media (max-width: 576px) {
  .scanner-video {
    height: min(50vh, 360px);
  }
}
</style>

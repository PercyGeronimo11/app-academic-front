<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3 px-3 px-md-4">

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">

            <!-- Título -->
            <h5 class="fw-bold text-primary mb-0 d-flex align-items-center">
              <i class="fas fa-chart-line me-2"></i>
              Registrar asistencias por QR
            </h5>

            <!-- Fecha -->
            <div class="w-30 w-md-auto">
              <CBadge color="dark" class="px-3 py-2 fs-6 w-100 w-md-auto text-center">
                📅 {{ fechaHora }}
              </CBadge>
            </div>
          </div>

        </CCardHeader>
      </CCard>
    </CCol>
  </CRow>


  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-lg border-0">
        <CCardHeader class="bg-primary d-flex align-items-center justify-content-between">
          <div class="fw-bold text-white">
            <i class="fas fa-qrcode me-2"></i>
            Escáner de Asistencia
          </div>

          <CBadge color="success" v-if="scanning">
            <i class="fas fa-circle me-1"></i> Activo
          </CBadge>

          <CBadge color="danger" v-else>
            Inactivo
          </CBadge>
        </CCardHeader>

        <CCardBody class="text-center">

          <!-- Video scanner -->
          <div class="scanner-wrapper mb-3">
            <video ref="videoRef" class="scanner-video"></video>

            <div v-if="scanning" class="scanner-line"></div>
          </div>

          <!-- DNI detectado -->
          <div v-if="dniDetectado" class="mt-3">

            <CBadge color="info" class="px-3 py-2 fs-6">
              <i class="fas fa-id-card me-2"></i>
              DNI detectado: {{ dniDetectado }}
            </CBadge>

          </div>

          <!-- Botones -->
          <div class="d-flex justify-content-center gap-3 mt-4">

            <CButton color="primary" size="md" @click="empezarScan" :disabled="scanning">
              <i class="fas fa-camera me-2"></i>
              Iniciar escaneo
            </CButton>

            <CButton color="danger" size="md" variant="outline" @click="apagarCamara" :disabled="!scanning">
              <i class="fas fa-power-off me-2"></i>
              Apagar cámara
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>


  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardBody class="bg-white py-3 px-3 px-md-4">

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div class="d-flex flex-column flex-sm-row gap-3 gap-md-4 w-100">
              <div class="flex-fill p-2 rounded bg-light">
                <div class="text-muted small">Total alumnos</div>
                <div class="fw-bold fs-5 d-flex align-items-center">
                  <i class="fas fa-users text-primary me-2"></i>
                  {{ totalAlumnos }}
                </div>
              </div>
              <div class="flex-fill p-2 rounded bg-light">
                <div class="text-muted small">Asistencias generadas</div>
                <div class="fw-bold fs-5 d-flex align-items-center">
                  <i class="fas fa-calendar-check text-success me-2"></i>
                  {{ asistenciasHoy }}
                </div>
              </div>

            </div>

            <!-- Botón -->
            <CButton :color="asistenciasCompletas ? 'success' : 'primary'" size="lg" class="w-100 w-md-auto shadow-sm"
              @click="generarAsistencias" :disabled="asistenciasCompletas">
              <i :class="asistenciasCompletas
                ? 'fas fa-check-circle me-2'
                : 'fas fa-play-circle me-2'"></i>

              {{ asistenciasCompletas ? 'Asistencias generadas' : 'Generar Asistencias' }}
            </CButton>

          </div>


        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref, onBeforeUnmount, computed, onMounted } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import AssistanceService from "@/services/AssistanceService";
import Swal from 'sweetalert2'
import { CCardBody } from '@coreui/vue';
import { useFechaHora } from '@/composables/useFechaHora'
import { toastSuccess,toastError } from '@/utils/alerts'

const { fechaHora } = useFechaHora()


const dniDetectado = ref(null)
const scanning = ref(false)
let codeReader = null
let stream = null
let selectedDeviceId = null
let decodeControl = null

const asistenciasHoy = ref(0)
const totalAlumnos = ref(0)


const loadTotalAsistencias = async () => {

  try {
    const res = await AssistanceService.VAuxiliar_totalesAsistencias()

    asistenciasHoy.value = res.data.asistencias_hoy
    totalAlumnos.value = res.data.total_alumnos

  } catch (error) {
    console.log('Error al cargar totales de asistencias:', error);

  }

}

const generarAsistencias = async () => {

  const result = await Swal.fire({
    title: "Generar asistencias",
    text: "Se crearán asistencias en estado F para todos los alumnos",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Generar"
  })

  if (!result.isConfirmed) return

  try {

    const res = await AssistanceService.VAuxiliar_generarAsistencias()

    asistenciasHoy.value = res.data.asistencias_hoy
    totalAlumnos.value = res.data.total_alumnos
    toastSuccess(`${asistenciasHoy.value} Asistencias generadas correctamente `)

  } catch (error) {
    toastError('Error al generar asistencias')
  }

}


const videoRef = ref(null);

async function empezarScan() {
  if (scanning.value) return
  scanning.value = true

  try {
    codeReader = new BrowserQRCodeReader()
    const videoElement = document.getElementById('video')
    const devices = await BrowserQRCodeReader.listVideoInputDevices()

    if (devices.length === 0) {
      toastError('No se encontró cámara')
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
    videoRef.value.srcObject = stream
    await videoRef.value.play()

    // videoElement.srcObject = stream
    // videoElement.play()

    // Mantener la lógica original de detección continua
    decodeControl = codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.value, async (result, err) => {
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
    toastError('No se pudo iniciar la cámara')
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
    videoElement.style.backgroundColor = 'black'
  }

  scanning.value = false
  dniDetectado.value = null
  console.log('🔹 DNI detectado reseteado');
}

// === Función para registrar asistencia ===
async function registrarAsistencia(dni) {
  try {
    await AssistanceService.VAuxiliar_registrarAsistencia(dni)
    toastSuccess(`Asistencia registrada para DNI: ${dni}`)
  } catch (error) {
    console.error('❌ Error al registrar asistencia:', error)
    toastError(`No se pudo registrar la asistencia para DNI: ${dni}`)
  }
}

const asistenciasCompletas = computed(() => {
  return asistenciasHoy.value >= totalAlumnos.value && totalAlumnos.value > 0
})

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
  border: 2px dashed #dcdcdc;
  background: #000;
}

.scanner-video {
  width: 100%;
  height: 340px;
  object-fit: cover;
}

/* línea animada de escaneo */
.scanner-line {
  position: absolute;
  width: 100%;
  height: 3px;
  background: #20c997;
  top: 0;
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% {
    top: 0
  }

  50% {
    top: 95%
  }

  100% {
    top: 0
  }
}
</style>

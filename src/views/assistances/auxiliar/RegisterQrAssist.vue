<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <div class="d-flex justify-content-between align-items-center">

            <h5 class="fw-bold text-primary mb-0">
              <i class="fas fa-chart-line me-2"></i>
              Registrar asistencias por QR
            </h5>

            <div class="d-flex align-items-center">
              <span class="me-2 text-success fw-semibold ">
                Monitoreo
              </span>
              <span style="width:10px;height:10px;border-radius:50%;background:#2eb85c;display:inline-block;"></span>
            </div>
          </div>
        </CCardHeader>
      </CCard>
    </CCol>
  </CRow>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">

        <CCardBody class="bg-white py-3">

          <div class="d-flex justify-content-between align-items-center">

            <!-- Estadísticas -->
            <div class="d-flex align-items-center gap-4">

              <div>
                <div class="text-muted small">Total alumnos</div>
                <div class="fw-bold fs-5">
                  <i class="fas fa-users text-primary me-1"></i>
                  {{ totalAlumnos }}
                </div>
              </div>

              <div>
                <div class="text-muted small">Asistencias  generadas</div>
                <div class="fw-bold fs-5">
                  <i class="fas fa-calendar-check text-success me-1"></i>
                  {{ asistenciasHoy }}
                </div>
              </div>

            </div>

            <!-- Botón -->
            <CButton color="primary" size="lg" @click="generarAsistencias" :disabled="asistenciasCompletas">
              <i class="fas fa-check-circle me-2"></i>
              Generar Asistencias
            </CButton>

          </div>

          <!-- Estado -->
          <div class="mt-3 text-end">

            <span v-if="asistenciasCompletas" class="text-success fw-semibold">
              <i class="fas fa-circle-check me-1"></i>
              Las asistencias del día ya fueron generadas
            </span>

            <span v-else class="text-warning fw-semibold">
              <i class="fas fa-exclamation-circle me-1"></i>
              Faltan asistencias por generar
            </span>

          </div>

        </CCardBody>

      </CCard>
    </CCol>
  </CRow>

  <CRow class="justify-content-center">
    <CCol md="8" lg="6">

      <CCard class="shadow-lg border-0">

        <CCardHeader class="bg-light d-flex align-items-center justify-content-between">
          <div class="fw-bold text-primary">
            <i class="fas fa-qrcode me-2"></i>
            Escáner de Asistencia
          </div>

          <CBadge color="success" v-if="scanning">
            <i class="fas fa-circle me-1"></i> Activo
          </CBadge>

          <CBadge color="secondary" v-else>
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

            <CButton color="primary" size="lg" @click="empezarScan" :disabled="scanning">
              <i class="fas fa-camera me-2"></i>
              Iniciar escaneo
            </CButton>

            <CButton color="danger" size="lg" variant="outline" @click="apagarCamara" :disabled="!scanning">
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
import { ref, onBeforeUnmount, computed, onMounted } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import AssistanceService from "@/services/AssistanceService";
import Swal from 'sweetalert2'
import { CCardBody } from '@coreui/vue';

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

    Swal.fire({
      icon: "success",
      title: "Asistencias generadas correctamente",
      text: `Total generadas hoy: ${asistenciasHoy.value}`
    })

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Error al generar asistencias"
    })

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
    videoElement.style.backgroundColor = 'black'
  }

  scanning.value = false
  dniDetectado.value = null
  console.log('🔹 DNI detectado reseteado');
}

// === Función para registrar asistencia ===
async function registrarAsistencia(dni) {
  try {
    const response = await AssistanceService.VAuxiliar_registrarAsistencia(dni)
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

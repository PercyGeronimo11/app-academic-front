<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-primary">
          <div class="fw-bold text-white">
            <i class="fas fa-id-card me-2"></i>
            Carnets QR de asistencia
          </div>
        </CCardHeader>

        <CCardBody>
          <p class="text-body-secondary small mb-4">
            Descarga el PDF con los carnets de una sección, listo para imprimir en hojas A4
            (8 carnets por página). Cada carnet incluye el código QR que lee el escáner de
            asistencia.
          </p>

          <div v-if="loading" class="text-center py-4">
            <CSpinner color="primary" />
            <div class="small text-body-secondary mt-2">Cargando secciones...</div>
          </div>

          <CAlert v-else-if="errorCarga" color="danger" class="mb-0">
            {{ errorCarga }}
          </CAlert>

          <CAlert v-else-if="!secciones.length" color="info" class="mb-0">
            No tiene secciones asignadas para descargar carnets. Comuníquese con dirección.
          </CAlert>

          <div v-else class="qr-cards-grid">
            <div
              v-for="seccion in secciones"
              :key="seccion.aula_id"
              class="qr-card"
            >
              <div class="qr-card__info">
                <div class="qr-card__grade">{{ seccion.etiqueta }}</div>
                <div class="qr-card__count">
                  <i class="fas fa-users me-1"></i>
                  {{ seccion.total_alumnos }}
                  {{ seccion.total_alumnos === 1 ? 'alumno' : 'alumnos' }}
                </div>
              </div>

              <CButton
                color="primary"
                class="qr-card__btn"
                :disabled="descargandoId !== null || seccion.total_alumnos === 0"
                @click="descargar(seccion)"
              >
                <CSpinner v-if="descargandoId === seccion.aula_id" size="sm" class="me-2" />
                <i v-else class="fas fa-download me-2"></i>
                {{ descargandoId === seccion.aula_id ? 'Generando...' : 'Descargar PDF' }}
              </CButton>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { toastSuccess, toastError } from '@/utils/alerts'

const secciones = ref([])
const loading = ref(true)
const errorCarga = ref('')
const descargandoId = ref(null)

const cargarSecciones = async () => {
  loading.value = true
  errorCarga.value = ''
  try {
    const res = await AssistanceService.getSeccionesCarnetsQr()
    secciones.value = res.data?.secciones ?? []
  } catch (error) {
    errorCarga.value =
      error?.response?.data?.mensaje || 'No se pudieron cargar las secciones.'
  } finally {
    loading.value = false
  }
}

const descargar = async (seccion) => {
  descargandoId.value = seccion.aula_id
  try {
    const total = await AssistanceService.descargarCarnetsQr({
      aula_id: seccion.aula_id,
      grade: seccion.grade,
      section: seccion.section,
    })
    toastSuccess(
      total
        ? `${total} carnets descargados (${seccion.etiqueta}).`
        : `Carnets de ${seccion.etiqueta} descargados.`,
    )
  } catch (error) {
    // El backend responde JSON en los errores, pero axios lo entrega como Blob.
    let mensaje = 'No se pudo generar el PDF de carnets.'
    const data = error?.response?.data
    if (data instanceof Blob) {
      try {
        const texto = await data.text()
        mensaje = JSON.parse(texto)?.mensaje || mensaje
      } catch {
        /* se mantiene el mensaje por defecto */
      }
    } else if (data?.mensaje) {
      mensaje = data.mensaje
    }
    toastError(mensaje)
  } finally {
    descargandoId.value = null
  }
}

onMounted(cargarSecciones)
</script>

<style scoped>
.qr-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.qr-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--rp-border-strong, #d8dbe0);
  border-radius: 0.65rem;
  background-color: var(--cui-body-bg, #fff);
}

.qr-card__grade {
  font-size: 1.05rem;
  font-weight: 700;
}

.qr-card__count {
  font-size: 0.85rem;
  color: var(--cui-secondary-color, #6b7280);
}

/* Area tactil comoda en movil */
.qr-card__btn {
  width: 100%;
  min-height: 44px;
}

@media (min-width: 576px) {
  .qr-cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .qr-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .qr-card__btn {
    width: auto;
    min-width: 11rem;
  }
}

@media (min-width: 992px) {
  .qr-cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

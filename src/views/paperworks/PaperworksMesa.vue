<template>
  <CardComponent title="Trámites — MESA_PARTES" style="margin: 20px 10px">
    <TramiteListShell>
      <template #intro>
        <p class="tls-intro-text mb-0">
          Revisa solicitudes FUT: aprueba para enviar a administración o observa para que el estudiante subsane.
        </p>
      </template>

      <CTable responsive hover class="align-middle mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Solicitante</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Asunto</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Motivo</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
            <CTableHeaderCell class="text-center">FUT</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody v-if="!items.length">
          <CTableRow>
            <CTableDataCell colspan="8" class="tls-empty-cell">
              <div class="tls-empty">
                <span class="tls-empty__icon" aria-hidden="true">📭</span>
                <p class="mb-1 fw-semibold">No hay trámites en esta bandeja</p>
                <p class="mb-0 small text-body-secondary">
                  Cuando los estudiantes envíen solicitudes, aparecerán aquí.
                </p>
              </div>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
        <CTableBody v-else>
          <template v-for="(item, index) in items" :key="item.id">
            <CTableRow>
              <CTableHeaderCell scope="row" class="text-center text-body-secondary fw-semibold">
                {{ index + 1 }}
              </CTableHeaderCell>
              <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
              <CTableDataCell class="text-center fw-medium">{{ item.names }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.subject }}</CTableDataCell>
              <CTableDataCell class="text-start small">{{ truncate(item.reason, 80) }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <TramiteStatusBadge :status="item.status" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton
                  color="primary"
                  size="sm"
                  variant="outline"
                  class="px-3"
                  :aria-label="`Ver documento FUT del trámite ${item.id}`"
                  @click="openPdfPreview(item)"
                >
                  <i class="fas fa-eye" aria-hidden="true"></i>
                </CButton>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <div class="d-flex gap-1 flex-wrap justify-content-center align-items-center">
                  <CButton color="success" size="sm" @click="approve(item.id)">Aprobar</CButton>
                  <CButton color="warning" size="sm" @click="openObserve(item)">Observar</CButton>
                  <CButton
                    color="secondary"
                    size="sm"
                    variant="outline"
                    class="px-2"
                    :aria-expanded="!!expanded[item.id]"
                    :aria-label="expanded[item.id] ? 'Ocultar historial' : 'Desplegar historial'"
                    @click="toggle(item.id)"
                  >
                    <i
                      class="fas fa-chevron-down expand-chevron"
                      :class="{ 'expand-chevron--open': expanded[item.id] }"
                      aria-hidden="true"
                    ></i>
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-show="expanded[item.id]" class="tls-expand-row">
              <CTableDataCell colspan="8" class="p-0 border-0">
                <div class="tls-expand-inner">
                  <TramiteHistory :steps="item.status_history" />
                </div>
              </CTableDataCell>
            </CTableRow>
          </template>
        </CTableBody>
      </CTable>
    </TramiteListShell>

    <TramitePdfPreviewModal
      :visible="pdfModalVisible"
      :loading="pdfLoading"
      :pdf-object-url="pdfObjectUrl"
      :observations="pdfModalObservations"
      @close="closePdfModal"
    />
  </CardComponent>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import CardComponent from '@/components/cruds/CardComponent.vue';
import TramiteListShell from '@/components/paperworks/TramiteListShell.vue';
import TramiteHistory from '@/components/paperworks/TramiteHistory.vue';
import TramiteStatusBadge from '@/components/paperworks/TramiteStatusBadge.vue';
import TramitePdfPreviewModal from '@/components/paperworks/TramitePdfPreviewModal.vue';
import PaperworkService from '@/services/PaperworkService';
import { formatDatabaseDate } from '@/utils/time';

const items = ref([]);
const expanded = reactive({});

const pdfModalVisible = ref(false);
const pdfLoading = ref(false);
const pdfObjectUrl = ref('');
const pdfModalObservations = ref('');

const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n)}…` : s || '');

const mapHistory = (details) =>
  (details || []).map((d) => ({
    at: formatDatabaseDate(d.created_at),
    label: d.status?.name || '—',
  }));

const load = async () => {
  try {
    const res = await PaperworkService.list();
    const payload = res.data;
    if (!payload.success) return;
    items.value = (payload.data || []).map((item) => {
      const [date] = formatDatabaseDate(item.created_at).split(' ');
      return {
        id: item.id,
        names: item.names,
        subject: item.subject,
        reason: item.reason,
        date,
        status: item.current_status,
        observations: item.observations,
        status_history: mapHistory(item.details),
      };
    });
  } catch (e) {
    console.error(e);
    Swal.fire('Error', 'No se pudo cargar la lista de trámites.', 'error');
  }
};

const toggle = (id) => {
  expanded[id] = !expanded[id];
};

const revokePdfUrl = () => {
  if (pdfObjectUrl.value) {
    URL.revokeObjectURL(pdfObjectUrl.value);
    pdfObjectUrl.value = '';
  }
};

const openPdfPreview = async (item) => {
  pdfModalObservations.value = item.observations || '';
  pdfModalVisible.value = true;
  pdfLoading.value = true;
  revokePdfUrl();
  try {
    const blob = await PaperworkService.fetchPdfBlob(item.id);
    pdfObjectUrl.value = URL.createObjectURL(blob);
    await load();
    const refreshed = items.value.find((r) => r.id === item.id);
    if (refreshed?.observations) {
      pdfModalObservations.value = refreshed.observations;
    }
  } catch (e) {
    const msg =
      e.response?.data?.message ||
      (typeof e.response?.data === 'string' ? e.response.data : null) ||
      e.message ||
      'No se pudo cargar el PDF.';
    Swal.fire('Error', msg, 'error');
    pdfModalVisible.value = false;
    pdfModalObservations.value = '';
  } finally {
    pdfLoading.value = false;
  }
};

const closePdfModal = () => {
  pdfModalVisible.value = false;
  pdfModalObservations.value = '';
  revokePdfUrl();
};

onBeforeUnmount(() => {
  revokePdfUrl();
});

const approve = async (id) => {
  const ok = await Swal.fire({
    title: '¿Aprobar trámite?',
    text: 'Pasará a revisión de administración.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aprobar',
  });
  if (!ok.isConfirmed) return;
  try {
    await PaperworkService.approveMesa(id);
    await load();
    Swal.fire('Listo', 'Trámite aprobado por mesa de partes.', 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo aprobar.', 'error');
  }
};

const openObserve = async (item) => {
  const { value: text } = await Swal.fire({
    title: 'Observaciones',
    input: 'textarea',
    inputLabel: 'Indique qué debe corregir el solicitante',
    inputPlaceholder: 'Observaciones…',
    showCancelButton: true,
    confirmButtonText: 'Enviar observación',
    inputValidator: (v) => (!v || !v.trim() ? 'Debe indicar observaciones' : null),
  });
  if (!text) return;
  try {
    await PaperworkService.observeMesa(item.id, text.trim());
    await load();
    Swal.fire('Listo', 'Trámite observado por mesa de partes.', 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo registrar la observación.', 'error');
  }
};

onMounted(load);
</script>

<style scoped>
.expand-chevron {
  display: inline-block;
  transition: transform 0.2s ease;
}

.expand-chevron--open {
  transform: rotate(-180deg);
}
</style>

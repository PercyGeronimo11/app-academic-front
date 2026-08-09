<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <h4 class="fw-bold text-primary mb-2 d-flex align-items-center">
              <i :class="[config.iconClass, 'me-2']"></i>
              {{ pageTitle }}
            </h4>
            <p class="tls-intro-text mb-0 text-body-secondary small">
              {{ pageIntro }}
            </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="modern-table-shell">
              <CTable responsive hover align="middle" class="mb-0">
                <CTableHead class="modern-table-header text-center">
                  <CTableRow>
                    <CTableHeaderCell class="text-center">N° trámite</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Solicitante</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Asunto</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">FUT</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">
                      {{ isInbox ? 'Acciones' : 'Seguimiento' }}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody v-if="!items.length">
                  <CTableRow>
                    <CTableDataCell colspan="7" class="table-empty-cell">
                      <div class="table-empty-unified">
                        <span class="table-empty-unified__icon" aria-hidden="true">📭</span>
                        <p class="table-empty-unified__title">{{ emptyTitle }}</p>
                        <p class="table-empty-unified__hint">{{ emptyHint }}</p>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
                <CTableBody v-else>
                  <CTableRow v-for="item in items" :key="item.id">
                    <CTableHeaderCell scope="row" class="text-center text-nowrap fw-semibold">
                      {{ item.request_number || '—' }}
                    </CTableHeaderCell>
                    <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
                    <CTableDataCell class="text-center fw-medium">{{ item.names }}</CTableDataCell>
                    <CTableDataCell class="text-center">{{ item.subject }}</CTableDataCell>
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
                    <CTableDataCell class="text-center text-nowrap">
                      <div class="d-inline-flex gap-1 justify-content-center align-items-center flex-nowrap">
                        <template v-if="isInbox">
                          <CButton color="success" size="sm" @click="approve(item.id)">Aprobar</CButton>
                          <CButton color="warning" size="sm" @click="openObserve(item)">Observar</CButton>
                          <CButton color="danger" size="sm" @click="openReject(item)">
                            {{ config.rejectButtonLabel }}
                          </CButton>
                        </template>
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="outline"
                          class="px-2"
                          :aria-label="`Ver historial de estados del trámite ${item.id}`"
                          @click="openHistory(item)"
                        >
                          <i class="fas fa-history" aria-hidden="true"></i>
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

  <TramitePdfPreviewModal
    :visible="pdfModalVisible"
    :loading="pdfLoading"
    :pdf-object-url="pdfObjectUrl"
    :observations="pdfModalObservations"
    @close="closePdfModal"
  />

  <TramiteHistoryModal
    :visible="historyModalVisible"
    :steps="historySteps"
    :context-label="historyContextLabel"
    @close="closeHistory"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import TramiteStatusBadge from '@/components/paperworks/TramiteStatusBadge.vue';
import TramitePdfPreviewModal from '@/components/paperworks/TramitePdfPreviewModal.vue';
import TramiteHistoryModal from '@/components/paperworks/TramiteHistoryModal.vue';
import PaperworkService from '@/services/PaperworkService';
import { formatDatabaseDate } from '@/utils/time';

const props = defineProps({
  /** 'mesa' | 'admin' */
  variant: {
    type: String,
    required: true,
    validator: (v) => ['mesa', 'admin'].includes(v),
  },
  /** 'inbox' = solo accionables | 'history' = todos sin Aprobar/Observar */
  mode: {
    type: String,
    default: 'inbox',
    validator: (v) => ['inbox', 'history'].includes(v),
  },
});

const VARIANT_CONFIG = {
  mesa: {
    iconClass: 'fas fa-inbox',
    inboxTitle: 'Trámites en proceso — Mesa de partes',
    inboxIntro:
      'Solo solicitudes que requieren tu acción: aprueba, observa o marca como no admitido para cerrar el flujo.',
    historyTitle: 'Historial de trámites — Mesa de partes',
    historyIntro: 'Consulta el listado completo de trámites registrados y el seguimiento de sus estados.',
    inboxEmptyTitle: 'No hay trámites pendientes de tu acción',
    inboxEmptyHint: 'Cuando los estudiantes envíen solicitudes, aparecerán aquí para aprobar u observar.',
    historyEmptyTitle: 'No hay trámites registrados',
    historyEmptyHint: 'Cuando existan solicitudes FUT, se mostrarán en este historial.',
    actionableStatuses: ['PENDIENTE DE REVISION', 'EN REVISION POR MESA DE PARTES'],
    approveConfirmText: 'Pasará a revisión de administración.',
    approveSuccess: 'Trámite aprobado por mesa de partes.',
    observeTitle: 'Observaciones',
    observeLabel: 'Indique qué debe corregir el solicitante',
    observeSuccess: 'Trámite observado por mesa de partes.',
    rejectButtonLabel: 'No admitido',
    rejectTitle: 'Marcar como no admitido',
    rejectLabel: 'Indique el motivo por el cual no se admite el trámite',
    rejectConfirmText: 'Sí, no admitir',
    rejectSuccess: 'Trámite marcado como no admitido. El flujo ha finalizado.',
    approveFn: (id) => PaperworkService.approveMesa(id),
    observeFn: (id, text) => PaperworkService.observeMesa(id, text),
    rejectFn: (id, text) => PaperworkService.rejectMesa(id, text),
  },
  admin: {
    iconClass: 'fas fa-building',
    inboxTitle: 'Trámites en proceso — Administración',
    inboxIntro:
      'Trámites que requieren tu acción. Puedes aprobar, observar o denegar para cerrar el flujo.',
    historyTitle: 'Historial de trámites — Administración',
    historyIntro: 'Consulta el listado completo de trámites registrados y el seguimiento de sus estados.',
    inboxEmptyTitle: 'No hay trámites pendientes de tu acción',
    inboxEmptyHint: 'Aparecerán aquí cuando mesa de partes envíe solicitudes o un estudiante subsane una observación tuya.',
    historyEmptyTitle: 'No hay trámites registrados',
    historyEmptyHint: 'Cuando existan solicitudes FUT, se mostrarán en este historial.',
    actionableStatuses: ['REVISADO POR MESA DE PARTES', 'EN REVISION POR ADMINISTRACION'],
    approveConfirmText:
      'El trámite quedará como aprobado exitosamente y el auxiliar de las aulas correspondientes podrá tomarlo.',
    approveSuccess: 'Trámite aprobado exitosamente.',
    observeTitle: 'Observaciones de administración',
    observeLabel: 'Indique qué debe corregir el solicitante (al subsanar volverá a administración)',
    observeSuccess:
      'Trámite observado; el solicitante deberá subsanar y el trámite volverá a administración.',
    rejectButtonLabel: 'Denegado',
    rejectTitle: 'Denegar trámite',
    rejectLabel: 'Indique el motivo por el cual se deniega el trámite',
    rejectConfirmText: 'Sí, denegar',
    rejectSuccess: 'Trámite denegado. El flujo ha finalizado.',
    approveFn: (id) => PaperworkService.approveDirector(id),
    observeFn: (id, text) => PaperworkService.observeDirector(id, text),
    rejectFn: (id, text) => PaperworkService.denyDirector(id, text),
  },
};

const config = computed(() => VARIANT_CONFIG[props.variant]);
const isInbox = computed(() => props.mode === 'inbox');

const pageTitle = computed(() =>
  isInbox.value ? config.value.inboxTitle : config.value.historyTitle,
);
const pageIntro = computed(() =>
  isInbox.value ? config.value.inboxIntro : config.value.historyIntro,
);
const emptyTitle = computed(() =>
  isInbox.value ? config.value.inboxEmptyTitle : config.value.historyEmptyTitle,
);
const emptyHint = computed(() =>
  isInbox.value ? config.value.inboxEmptyHint : config.value.historyEmptyHint,
);

const items = ref([]);

const pdfModalVisible = ref(false);
const pdfLoading = ref(false);
const pdfObjectUrl = ref('');
const pdfModalObservations = ref('');

const historyModalVisible = ref(false);
const historySteps = ref([]);
const historyContextLabel = ref('');

const mapHistory = (details) =>
  (details || []).map((d) => ({
    at: formatDatabaseDate(d.created_at),
    label: d.status?.name || '—',
  }));

const mapItem = (item) => {
  const [date] = formatDatabaseDate(item.created_at).split(' ');
  return {
    id: item.id,
    request_number: item.request_number || '',
    names: item.names,
    subject: item.subject,
    date,
    status: item.current_status,
    observations: item.observations,
    status_history: mapHistory(item.details),
  };
};

const load = async () => {
  try {
    const res = await PaperworkService.list();
    const payload = res.data;
    if (!payload.success) return;

    let rows = (payload.data || []).map(mapItem);
    if (isInbox.value) {
      const allowed = config.value.actionableStatuses;
      rows = rows.filter((row) => allowed.includes(row.status));
    }
    items.value = rows;
  } catch (e) {
    console.error(e);
    Swal.fire('Error', 'No se pudo cargar la lista de trámites.', 'error');
  }
};

watch(
  () => [props.variant, props.mode],
  () => {
    load();
  },
);

const openHistory = (item) => {
  historySteps.value = item.status_history || [];
  historyContextLabel.value = [item.request_number, item.names, item.subject]
    .filter(Boolean)
    .join(' · ');
  historyModalVisible.value = true;
};

const closeHistory = () => {
  historyModalVisible.value = false;
  historySteps.value = [];
  historyContextLabel.value = '';
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
    text: config.value.approveConfirmText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aprobar',
  });
  if (!ok.isConfirmed) return;
  try {
    await config.value.approveFn(id);
    await load();
    Swal.fire('Listo', config.value.approveSuccess, 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo aprobar.', 'error');
  }
};

const openObserve = async (item) => {
  const { value: text } = await Swal.fire({
    title: config.value.observeTitle,
    input: 'textarea',
    inputLabel: config.value.observeLabel,
    inputPlaceholder: 'Observaciones…',
    showCancelButton: true,
    confirmButtonText: 'Enviar observación',
    inputValidator: (v) => (!v || !v.trim() ? 'Debe indicar observaciones' : null),
  });
  if (!text) return;
  try {
    await config.value.observeFn(item.id, text.trim());
    await load();
    Swal.fire('Listo', config.value.observeSuccess, 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo registrar la observación.', 'error');
  }
};

const openReject = async (item) => {
  const { value: text } = await Swal.fire({
    title: config.value.rejectTitle,
    input: 'textarea',
    inputLabel: config.value.rejectLabel,
    inputPlaceholder: 'Motivo…',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: config.value.rejectConfirmText,
    confirmButtonColor: '#dc3545',
    inputValidator: (v) => (!v || !v.trim() ? 'Debe indicar el motivo' : null),
  });
  if (!text) return;
  try {
    await config.value.rejectFn(item.id, text.trim());
    await load();
    Swal.fire('Listo', config.value.rejectSuccess, 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo cerrar el trámite.', 'error');
  }
};

onMounted(load);
</script>

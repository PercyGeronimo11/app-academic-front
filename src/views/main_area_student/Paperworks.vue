<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 class="fw-bold text-primary mb-1 d-flex align-items-center">
                  <i class="fas fa-file-alt me-2"></i>
                  Mis trámites
                </h4>
                <p class="mb-0 text-body-secondary small">
                  Lista de solicitudes FUT que has registrado y su estado actual.
                </p>
              </div>
              <CButton color="primary" class="px-4" @click="goToRegister">
                <CIcon class="me-2" icon="cil-file" size="sm" />
                Registrar trámite
              </CButton>
            </div>
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
                    <CTableHeaderCell
                      v-for="h in tableHeaders"
                      :key="h"
                      scope="col"
                      class="text-center"
                    >
                      {{ h }}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody v-if="!tableItems.length">
                  <CTableRow>
                    <CTableDataCell colspan="6" class="table-empty-cell">
                      <div class="table-empty-unified">
                        <span class="table-empty-unified__icon" aria-hidden="true">📋</span>
                        <p class="table-empty-unified__title">Aún no registras trámites</p>
                        <p class="table-empty-unified__hint">
                          Usa <strong>Registrar trámite</strong> para generar tu solicitud en formato FUT.
                        </p>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
                <CTableBody v-else>
                  <template v-for="item in tableItems" :key="item.id">
                    <CTableRow>
                      <CTableHeaderCell scope="row" class="text-center text-nowrap fw-semibold">
                        {{ item.request_number || '—' }}
                      </CTableHeaderCell>
                      <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
                      <CTableDataCell class="text-center fw-medium">{{ item.responsible }}</CTableDataCell>
                      <CTableDataCell class="text-center">
                        <TramiteStatusBadge
                          :status="item.status"
                          :show-observation-eye="canViewObservation(item)"
                          @view-observation="showObservation(item)"
                        />
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
                        <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                          <CButton
                            color="secondary"
                            size="sm"
                            variant="outline"
                            class="px-2"
                            :aria-expanded="!!expanded[item.id]"
                            :aria-label="expanded[item.id] ? 'Ocultar historial de estados' : 'Desplegar historial de estados'"
                            @click="toggle(item.id)"
                          >
                            <i
                              class="fas fa-chevron-down expand-chevron"
                              :class="{ 'expand-chevron--open': expanded[item.id] }"
                              aria-hidden="true"
                            ></i>
                          </CButton>
                          <CButton
                            v-if="canEditPaperwork(item.status)"
                            color="warning"
                            size="sm"
                            @click="editPaperwork(item)"
                          >
                            Subsanar
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow v-show="expanded[item.id]" class="tls-expand-row">
                      <CTableDataCell colspan="6" class="p-0 border-0">
                        <div class="tls-expand-inner">
                          <TramiteHistory :steps="item.status_history" />
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  </template>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

    <ModalPaperwork
      v-model:isOpenModal="isOpenModalPaperwork"
      :paperwork="selectedPaperwork"
      @updatePaperwork="onUpdatePaperwork"
    />

    <TramitePdfPreviewModal
      :visible="pdfModalVisible"
      :loading="pdfLoading"
      :pdf-object-url="pdfObjectUrl"
      @close="closePdfModal"
    />

    <TramiteObservationModal
      :visible="observationModalVisible"
      :status="observationStatus"
      :observations="observationText"
      @close="closeObservation"
    />
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import TramiteHistory from '@/components/paperworks/TramiteHistory.vue';
import TramiteStatusBadge from '@/components/paperworks/TramiteStatusBadge.vue';
import TramitePdfPreviewModal from '@/components/paperworks/TramitePdfPreviewModal.vue';
import TramiteObservationModal from '@/components/paperworks/TramiteObservationModal.vue';
import ModalPaperwork from './modals/ModalPaperwork.vue';
import PaperworkService from '../../services/PaperworkService';
import { formatDatabaseDate } from '../../utils/time';

const router = useRouter();

const tableHeaders = ref([]);
const tableItems = ref([]);
const expanded = reactive({});

const selectedPaperwork = ref(null);

onMounted(async () => {
  tableHeaders.value = [
    'N° trámite',
    'Fecha',
    'Responsable',
    'Estado',
    'FUT',
    'Acciones',
  ];
  await listPaperWorks();
});

const isOpenModalPaperwork = ref(false);

const mapHistory = (details) =>
  (details || []).map((d) => ({
    at: formatDatabaseDate(d.created_at),
    label: d.status?.name || '—',
  }));

const normalizeStudentStatus = (status) => {
  const s = status || '';
  if (s === 'EN REVISION POR MESA DE PARTES') return 'EN REVISIÓN POR MESA DE PARTES';
  if (s === 'EN REVISION POR ADMINISTRACION') return 'EN REVISIÓN POR ADMINISTRACIÓN';
  return s;
};

const listPaperWorks = async () => {
  try {
    let response = await PaperworkService.list();
    response = response.data;

    if (response.success) {
      tableItems.value = response.data.map((item) => {
        const [date] = formatDatabaseDate(item.created_at).split(' ');
        return {
          id: item.id,
          request_number: item.request_number || '',
          subject: item.subject,
          recipient: item.recipient,
          reason: item.reason,
          date,
          responsible: item.names,
          status: normalizeStudentStatus(item.current_status),
          observations: item.observations,
          signature_url: item.signature_url || '',
          attachments: item.attachments || [],
          status_history: mapHistory(item.details),
        };
      });
    }
  } catch (error) {
    console.log('Error al obtener lista de tramites', error);
  }
};

const toggle = (id) => {
  expanded[id] = !expanded[id];
};

const pdfModalVisible = ref(false);
const pdfLoading = ref(false);
const pdfObjectUrl = ref('');

const revokePdfUrl = () => {
  if (pdfObjectUrl.value) {
    URL.revokeObjectURL(pdfObjectUrl.value);
    pdfObjectUrl.value = '';
  }
};

const OBSERVATION_STATUSES = [
  'OBSERVADO POR MESA DE PARTES',
  'OBSERVADO POR EL DIRECTOR',
  'NO ADMITIDO',
  'DENEGADO',
];

const observationModalVisible = ref(false);
const observationStatus = ref('');
const observationText = ref('');

const canViewObservation = (item) =>
  OBSERVATION_STATUSES.includes(item.status) && !!String(item.observations || '').trim();

const showObservation = (item) => {
  observationStatus.value = item.status || '';
  observationText.value = String(item.observations || '').trim();
  observationModalVisible.value = true;
};

const closeObservation = () => {
  observationModalVisible.value = false;
  observationStatus.value = '';
  observationText.value = '';
};

const openPdfPreview = async (item) => {
  pdfModalVisible.value = true;
  pdfLoading.value = true;
  revokePdfUrl();
  try {
    const blob = await PaperworkService.fetchPdfBlob(item.id);
    pdfObjectUrl.value = URL.createObjectURL(blob);
  } catch (e) {
    const msg =
      e.response?.data?.message ||
      (typeof e.response?.data === 'string' ? e.response.data : null) ||
      e.message ||
      'No se pudo cargar el PDF.';
    Swal.fire('Error', msg, 'error');
    pdfModalVisible.value = false;
  } finally {
    pdfLoading.value = false;
  }
};

const closePdfModal = () => {
  pdfModalVisible.value = false;
  revokePdfUrl();
};

onBeforeUnmount(() => {
  revokePdfUrl();
});

const goToRegister = () => {
  router.push('/register-paperwork');
};

const editPaperwork = (item) => {
  selectedPaperwork.value = item;
  isOpenModalPaperwork.value = true;
};

/** Subsanar solo cuando hubo observación (mesa o administración); no en pendiente ni “en revisión”. */
const EDITABLE_STATUSES = ['OBSERVADO POR MESA DE PARTES', 'OBSERVADO POR EL DIRECTOR'];

const canEditPaperwork = (status) => EDITABLE_STATUSES.includes(status);

const onUpdatePaperwork = async (formData) => {
  if (!selectedPaperwork.value?.id) {
    Swal.fire('Error', 'No se encontró el trámite a actualizar.', 'error');
    return;
  }
  try {
    const response = await PaperworkService.updatePaperwork(selectedPaperwork.value.id, formData);
    const payload = response.data;
    if (payload.success) {
      await listPaperWorks();
      Swal.fire(
        'Actualizado',
        payload.message || 'Trámite actualizado y reenviado para revisión.',
        'success',
      );
    } else {
      Swal.fire('Error', payload.message || 'No se pudo actualizar.', 'error');
    }
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo actualizar el trámite.', 'error');
  }
};
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
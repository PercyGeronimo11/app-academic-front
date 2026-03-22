<template>
  <CardComponent title="Trámites — Mesa de partes" style="margin: 20px 10px">
    <CRow class="mb-3">
      <CCol>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Fecha</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Solicitante</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Asunto</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Motivo</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Seguimiento</CTableHeaderCell>
              <CTableHeaderCell class="text-center">PDF</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <template v-for="(item, index) in items" :key="item.id">
              <CTableRow>
                <CTableHeaderCell class="text-center">{{ index + 1 }}</CTableHeaderCell>
                <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ item.names }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ item.subject }}</CTableDataCell>
                <CTableDataCell class="text-start small">{{ truncate(item.reason, 80) }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ item.status }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton color="secondary" size="sm" @click="toggle(item.id)">
                    {{ expanded[item.id] ? 'Ocultar' : 'Ver' }} historial
                  </CButton>
                </CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton color="info" size="sm" @click="downloadPdf(item.id)">Descargar</CButton>
                </CTableDataCell>
                <CTableDataCell class="text-center d-flex gap-1 flex-wrap justify-content-center">
                  <CButton color="success" size="sm" @click="approve(item.id)">Aprobar</CButton>
                  <CButton color="warning" size="sm" @click="openObserve(item)">Observar</CButton>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-show="expanded[item.id]">
                <CTableDataCell colspan="9">
                  <TramiteHistory :steps="item.status_history" />
                </CTableDataCell>
              </CTableRow>
            </template>
          </CTableBody>
        </CTable>
      </CCol>
    </CRow>
  </CardComponent>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import CardComponent from '@/components/cruds/CardComponent.vue';
import TramiteHistory from '@/components/paperworks/TramiteHistory.vue';
import PaperworkService from '@/services/PaperworkService';
import { formatDatabaseDate } from '@/utils/time';

const items = ref([]);
const expanded = reactive({});

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

const downloadPdf = async (id) => {
  try {
    await PaperworkService.downloadPdf(id);
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo descargar el PDF.', 'error');
  }
};

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

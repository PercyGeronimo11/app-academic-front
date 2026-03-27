<template>
  <CardComponent title="Permisos derivados — Auxiliar" style="margin: 20px 10px">
    <TramiteListShell>
      <template #intro>
        <p class="tls-intro-text mb-0">
          Trámites aprobados por administración y mesa de partes. Aquí puedes tomar conocimiento del alumno, la fecha de registro y el motivo del permiso.
        </p>
      </template>

      <CTable responsive hover class="align-middle mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Fecha registro</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Alumno</CTableHeaderCell>
            <CTableHeaderCell class="text-center">DNI</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Asunto</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Motivo</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Estado</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Seguimiento</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody v-if="!items.length">
          <CTableRow>
            <CTableDataCell colspan="9" class="tls-empty-cell">
              <div class="tls-empty">
                <span class="tls-empty__icon" aria-hidden="true">📭</span>
                <p class="mb-1 fw-semibold">No hay permisos derivados</p>
                <p class="mb-0 small text-body-secondary">
                  Cuando administración derive trámites al auxiliar, se listarán aquí.
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
              <CTableDataCell class="text-center">{{ item.dni }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.subject }}</CTableDataCell>
              <CTableDataCell class="text-start small">{{ item.reason }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <TramiteStatusBadge :status="item.status" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton color="secondary" size="sm" variant="outline" @click="toggle(item.id)">
                  {{ expanded[item.id] ? 'Ocultar' : 'Historial' }}
                </CButton>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton color="primary" size="sm" @click="ack(item.id)">Marcar completado</CButton>
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-show="expanded[item.id]" class="tls-expand-row">
              <CTableDataCell colspan="9" class="p-0 border-0">
                <div class="tls-expand-inner">
                  <TramiteHistory :steps="item.status_history" />
                </div>
              </CTableDataCell>
            </CTableRow>
          </template>
        </CTableBody>
      </CTable>
    </TramiteListShell>
  </CardComponent>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import CardComponent from '@/components/cruds/CardComponent.vue';
import TramiteListShell from '@/components/paperworks/TramiteListShell.vue';
import TramiteHistory from '@/components/paperworks/TramiteHistory.vue';
import TramiteStatusBadge from '@/components/paperworks/TramiteStatusBadge.vue';
import PaperworkService from '@/services/PaperworkService';
import { formatDatabaseDate } from '@/utils/time';

const items = ref([]);
const expanded = reactive({});

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
        identity_document: item.identity_document,
        dni: item.identity_document,
        subject: item.subject,
        reason: item.reason,
        date,
        status: item.current_status,
        status_history: mapHistory(item.details),
      };
    });
  } catch (e) {
    console.error(e);
    Swal.fire('Error', 'No se pudo cargar la lista.', 'error');
  }
};

const toggle = (id) => {
  expanded[id] = !expanded[id];
};

const ack = async (id) => {
  try {
    await PaperworkService.acknowledgeAuxiliar(id);
    await load();
    Swal.fire('Listo', 'Trámite marcado como completado.', 'success');
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo completar.', 'error');
  }
};

onMounted(load);
</script>

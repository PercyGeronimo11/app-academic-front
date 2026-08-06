<template>
  <CardComponent title="Trámites de mis aulas — Auxiliar" style="margin: 20px 10px">
    <TramiteListShell>
      <template #intro>
        <p class="tls-intro-text mb-0">
          Trámites de estudiantes de las aulas a tu cargo. Puedes ver el estado de cada uno desde el registro; cuando esté aprobado exitosamente, marca el permiso como completado.
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
                <p class="mb-1 fw-semibold">No hay trámites registrados</p>
                <p class="mb-0 small text-body-secondary">
                  Cuando un estudiante de tus aulas registre un trámite, aparecerá aquí con su estado.
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
                <CButton
                  color="secondary"
                  size="sm"
                  variant="outline"
                  :aria-label="`Ver historial de estados del trámite ${item.id}`"
                  @click="openHistory(item)"
                >
                  Historial
                </CButton>
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton
                  v-if="canComplete(item.status)"
                  color="primary"
                  size="sm"
                  @click="ack(item.id)"
                >
                  Marcar completado
                </CButton>
                <span v-else class="small text-body-secondary">—</span>
              </CTableDataCell>
            </CTableRow>
          </template>
        </CTableBody>
      </CTable>
    </TramiteListShell>
  </CardComponent>

  <TramiteHistoryModal
    :visible="historyModalVisible"
    :steps="historySteps"
    :context-label="historyContextLabel"
    @close="closeHistory"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import CardComponent from '@/components/cruds/CardComponent.vue';
import TramiteListShell from '@/components/paperworks/TramiteListShell.vue';
import TramiteStatusBadge from '@/components/paperworks/TramiteStatusBadge.vue';
import TramiteHistoryModal from '@/components/paperworks/TramiteHistoryModal.vue';
import PaperworkService from '@/services/PaperworkService';
import { formatDatabaseDate } from '@/utils/time';

const items = ref([]);
const historyModalVisible = ref(false);
const historySteps = ref([]);
const historyContextLabel = ref('');

const canComplete = (status) => status === 'APROBADO EXITOSAMENTE';

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

const openHistory = (item) => {
  historySteps.value = item.status_history || [];
  historyContextLabel.value = [item.names, item.subject].filter(Boolean).join(' · ');
  historyModalVisible.value = true;
};

const closeHistory = () => {
  historyModalVisible.value = false;
  historySteps.value = [];
  historyContextLabel.value = '';
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

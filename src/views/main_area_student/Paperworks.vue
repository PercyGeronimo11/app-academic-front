<template>
    <CardComponent title="Trámites del Estudiante" style="margin: 20px 10px;">
        <CRow class="mb-5">
            <CCol>
                <CButton type="button" color="primary" id="button-addon2" @click="newPaperwork">
                    <span class="cil-file"></span> Nuevo Trámite
                </CButton>
            </CCol>
        </CRow>
        <CRow class="mb-3">
            <CCol>
                <CTable>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell scope="col" v-for="tableHeader in tableHeaders" class="text-center">
                                {{ tableHeader }}
                            </CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <template v-for="(item, index) in tableItems" :key="item.id">
                            <CTableRow>
                                <CTableHeaderCell scope="row" class="text-center">{{ index+1 }}</CTableHeaderCell>
                                <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ item.responsible }}</CTableDataCell>
                                <CTableDataCell class="text-center">{{ item.status }}</CTableDataCell>
                                <CTableDataCell class="text-center">
                                    <CButton color="secondary" size="sm" @click="toggle(item.id)">
                                        {{ expanded[item.id] ? 'Ocultar' : 'Ver' }} historial
                                    </CButton>
                                </CTableDataCell>
                                <CTableDataCell class="text-center">
                                    <CButton color="info" size="sm" @click="downloadPdf(item.id)">Descargar PDF</CButton>
                                </CTableDataCell>
                                <CTableDataCell class="d-flex justify-content-center">
                                    <button
                                        v-if="canEditPaperwork(item.status)"
                                        type="button"
                                        class="btn btn-warning d-flex align-items-center justify-content-center"
                                        @click="editPaperwork(item)"
                                    >
                                        Subsanar
                                    </button>
                                </CTableDataCell>
                            </CTableRow>
                            <CTableRow v-show="expanded[item.id]">
                                <CTableDataCell colspan="7">
                                    <TramiteHistory :steps="item.status_history" />
                                </CTableDataCell>
                            </CTableRow>
                        </template>
                    </CTableBody>
                </CTable>
            </CCol>
        </CRow>
    </CardComponent>

    <ModalPaperwork
        v-model:isOpenModal="isOpenModalPaperwork"
        :paperwork="selectedPaperwork"
        @createPaperwork="createPaperwork"
        @updatePaperwork="onUpdatePaperwork"
    />
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import Swal from 'sweetalert2';
import CardComponent from '../../components/cruds/CardComponent.vue';
import TramiteHistory from '@/components/paperworks/TramiteHistory.vue';
import ModalPaperwork from './modals/ModalPaperwork.vue';
import PaperworkService from '../../services/PaperworkService';
import { formatDatabaseDate } from '../../utils/time';

const tableHeaders = ref([]);
const tableItems = ref([]);
const expanded = reactive({});

const selectedPaperwork = ref(null);

onMounted(async () => {
    tableHeaders.value = [
        'N°',
        'Fecha de Registro',
        'Responsable',
        'Estado',
        'Seguimiento',
        'PDF',
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

const listPaperWorks = async() => {
    try {
        let response = await PaperworkService.list();
        response = response.data;

        if(response.success){
            tableItems.value = response.data.map(item => {
                const [date] = formatDatabaseDate(item.created_at).split(" ");
                return {
                    id: item.id,
                    subject: item.subject,
                    recipient: item.recipient,
                    reason: item.reason,
                    date: date,
                    responsible: item.names,
                    status: item.current_status,
                    observations: item.observations,
                    status_history: mapHistory(item.details),
                }
            });
        }
    } catch (error) {
        console.log('Error al obtener lista de tramites', error);
    }
}

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

const newPaperwork = () => {
    selectedPaperwork.value = null;
    isOpenModalPaperwork.value=true;
};

const editPaperwork = (item) => {
    selectedPaperwork.value = item;
    isOpenModalPaperwork.value = true;
};

const EDITABLE_STATUSES = [
    'OBSERVADO POR MESA DE PARTES',
    'OBSERVADO POR EL DIRECTOR',
];

const canEditPaperwork = (status) => EDITABLE_STATUSES.includes(status);

const createPaperwork = async (formData) => {
    try {
        const response = await PaperworkService.createPaperwork(formData);
        const payload = response.data;
        if (payload.success) {
            await listPaperWorks();
            Swal.fire('Registrado', payload.message || 'Trámite registrado correctamente.', 'success');
        } else {
            Swal.fire('Error', payload.message || 'No se pudo registrar.', 'error');
        }
    } catch (e) {
        Swal.fire('Error', e.response?.data?.message || 'No se pudo registrar el trámite.', 'error');
    }
};

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
            Swal.fire('Actualizado', payload.message || 'Trámite actualizado y reenviado a mesa de partes.', 'success');
        } else {
            Swal.fire('Error', payload.message || 'No se pudo actualizar.', 'error');
        }
    } catch (e) {
        Swal.fire('Error', e.response?.data?.message || 'No se pudo actualizar el trámite.', 'error');
    }
};

</script>

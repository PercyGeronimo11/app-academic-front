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
                        <CTableRow v-for="(item, index) in tableItems">
                            <CTableHeaderCell scope="row" class="text-center">{{ index+1 }}</CTableHeaderCell>
                            <CTableDataCell class="text-center">{{ item.date }}</CTableDataCell>
                            <CTableDataCell class="text-center">{{ item.responsible }}</CTableDataCell>
                            <CTableDataCell class="text-center">{{ item.status }}</CTableDataCell>
                            <CTableDataCell class="d-flex justify-content-center">
                                <!-- <button type="button" class="btn btn-warning d-flex align-items-center justify-content-center">
                                    <CIcon :icon="cilChevronCircleRightAlt" size="xl"/>
                                </button> -->
                                <button v-if="item.status=='PENDIENTE DE REVISION'" type="button" class="btn btn-warning d-flex align-items-center justify-content-center" @click="editPaperwork(item)">
                                    Editar
                                </button>
                            </CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </CCol>
        </CRow>
    </CardComponent>

    <ModalPaperwork
        v-model:isOpenModal="isOpenModalPaperwork"
        :paperwork="selectedPaperwork"
        @createPaperwork="createPaperwork"
        @updatePaperwork="updatePaperwork"
    />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CardComponent from '../../components/cruds/CardComponent.vue';
import { CIcon } from '@coreui/icons-vue';
import { cilChevronCircleRightAlt } from '@coreui/icons';
import ModalPaperwork from './modals/ModalPaperwork.vue';
import PaperworkService from '../../services/PaperworkService';
import { formatDatabaseDate } from '../../utils/time';

const tableHeaders = ref([]);
const tableItems = ref([]);

const selectedPaperwork = ref(null);

onMounted(async()=>{
    tableHeaders.value=[
        'N°',
        'Fecha de Registro',
        'Responsable',
        'Estado',
        'Acciones'
    ];

    tableItems.value=[
        {
            date:'2025-05-14',
            responsible: 'Alfredo',
            status: 'Pendiente de revisión del director' 
        }
    ]

    await listPaperWorks();
});

const isOpenModalPaperwork = ref(false);

const listPaperWorks = async() => {
    try {
        let response = await PaperworkService.list();
        response = response.data;

        if(response.success){
            tableItems.value = response.data.map(item => {
                const [date, hour] = formatDatabaseDate(item.created_at).split(" ");
                return {
                    subject: item.subject,
                    recipient: item.recipient,
                    reason: item.reason,
                    date: date,
                    hour: hour,
                    responsible: item.names,
                    reason: item.reason,
                    status: item.current_status
                }
            });
        }
    } catch (error) {
        console.log('Error al obtener lista de tramites', error);
    }
}

const newPaperwork = () => {
    selectedPaperwork.value = null;
    isOpenModalPaperwork.value=true;
};

const editPaperwork = (item) => {
    selectedPaperwork.value = item;
    isOpenModalPaperwork.value = true;
};

const createPaperwork = async(formData) => {

    console.log('=== DATOS RECIBIDOS DEL MODAL ===');

    // Ver contenido del FormData correctamente
    for (const [key, value] of formData.entries()) {

        if (value instanceof File) {
            console.log(key, 'Archivo:', value.name, '(', value.type, ')');
        } else {
            console.log(key, value);
        }

    }

    // Ejemplo si luego quieres enviarlo a una API
    const response = await PaperworkService.createPaperwork(formData);
    console.log('Response', response);
    

};

</script>
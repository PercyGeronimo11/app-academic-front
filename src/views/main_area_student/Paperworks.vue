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
                                <button type="button" class="btn btn-warning d-flex align-items-center justify-content-center">
                                    <CIcon :icon="cilChevronCircleRightAlt" size="xl"/>
                                </button>
                            </CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </CCol>
        </CRow>
    </CardComponent>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import CardComponent from '../../components/cruds/CardComponent.vue';
import { CIcon } from '@coreui/icons-vue';
import { cilChevronCircleRightAlt } from '@coreui/icons';

const tableHeaders = ref([]);
const tableItems = ref([]);

onMounted(()=>{
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
});

const newPaperwork = () => {

};
</script>
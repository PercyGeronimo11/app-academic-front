<template>
    <CModal :visible="isOpenModal" scrollable size="lg" @close="closeModal" aria-labelledby="LiveDemoExampleLabel" alignment="center">
        <CModalHeader>
            <CModalTitle id="LiveDemoExampleLabel">
                Importar Estudiantes
            </CModalTitle>
        </CModalHeader>
        <CModalBody>
            <CForm @submit.prevent="sendFile">
                <CContainer>
                    <CRow class="mb-3">
                        <CCol>
                            <CFormInput @change="onFileChange" accept=".xlsx,.xls" type="file" label="Archivo Excel" placeholder="Ingrese el archivo con la informacion requerida" required />
                        </CCol>
                    </CRow>
                </CContainer>
            </CForm>
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" @click="closeModal">
                Cancelar
            </CButton>
            <CButton color="primary" @click="sendFile">
                Importar Estudiantes
            </CButton>
        </CModalFooter>
    </CModal>
</template>

<script setup>
import { ref } from 'vue';
import StudentService from '../../services/StudentService';

const emit = defineEmits(['update:isOpenModal']);
const params = defineProps({
    isOpenModal: {
        type: Boolean,
        required: true
    }
});

const file = ref(null);

const onFileChange = (event) => {
  file.value = event.target.files[0];
}

const sendFile = async() => {
    const formData = new FormData();
    formData.append('file', file.value);

    try {
        const response = (await StudentService.importStudents(formData)).data;

        if(response.success){
            console.log(response.data);
            
        }
    } catch (error) {
        console.log("Error en el envio: "+ error);
    }
};

const closeModal = () => {
  emit('update:isOpenModal', false);
}
</script>
<template>
    <button type="button" class="btn btn-primary" @click="openModal">Importar {{ descripcion }}</button>

    <CModal :visible="isOpenModal" @close="isOpenModal = false" scrollable>
        <CModalHeader>
        <CModalTitle>Hola</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <h2>hola</h2>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" @click="isOpenModal = false">Cerrar</CButton>
        <CButton color="primary">Entendido</CButton>
        </CModalFooter>
    </CModal>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    descripcion: {
        type: String,
        required: true
    }
});

const isOpenModal = ref(false);

const openModal = () => {
    isOpenModal.value = true;
}
</script>
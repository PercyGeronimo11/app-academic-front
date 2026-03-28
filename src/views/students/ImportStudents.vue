<template>
  <CModal
    :visible="isOpenModal"
    scrollable
    size="lg"
    alignment="center"
    @close="closeModal"
  >
    <CModalHeader>
      <CModalTitle>Importar estudiantes desde Excel</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CAlert color="info" class="mb-3">
        <strong>Formato:</strong> Excel compatible con el reporte del SEAGIE.
        Los datos deben comenzar en la <strong>fila 13</strong>.
      </CAlert>

      <div class="border rounded p-3 mb-3 bg-body-secondary">
        <div class="fw-semibold mb-2">1. Descargar plantilla</div>
        <p class="small text-body-secondary mb-2">
          Obtenga la estructura esperada.
        </p>
        <CButton
          color="secondary"
          variant="outline"
          :disabled="downloadingTemplate"
          @click="downloadTemplate"
        >
          <CIcon v-if="!downloadingTemplate" icon="cil-cloud-download" class="me-2" />
          <CSpinner v-else component="span" size="sm" class="me-2" aria-hidden="true" />
          {{ downloadingTemplate ? 'Descargando…' : 'Descargar plantilla Excel' }}
        </CButton>
      </div>

      <div class="border rounded p-3">
        <div class="fw-semibold mb-2">2. Subir archivo completado</div>
        <CFormInput
          :key="fileInputKey"
          type="file"
          accept=".xlsx,.xls"
          label="Archivo (.xlsx, .xls)"
          @change="onFileChange"
        />
        <div v-if="file" class="small text-success mt-2">
          Seleccionado: {{ file.name }}
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="ghost" :disabled="importing" @click="closeModal">
        Cancelar
      </CButton>
      <CButton color="primary" :disabled="importing || !file" @click="sendFile">
        <CSpinner v-if="importing" component="span" size="sm" class="me-2" aria-hidden="true" />
        {{ importing ? 'Importando…' : 'Importar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import StudentService from '@/services/StudentService';
import Swal from 'sweetalert2';

const emit = defineEmits(['update:isOpenModal', 'updateData']);

const props = defineProps({
  isOpenModal: {
    type: Boolean,
    required: true,
  },
});

const file = ref(null);
const fileInputKey = ref(0);
const importing = ref(false);
const downloadingTemplate = ref(false);

watch(
  () => props.isOpenModal,
  (open) => {
    if (open) {
      fileInputKey.value += 1;
      file.value = null;
    }
  }
);

const onFileChange = (event) => {
  const f = event.target.files?.[0];
  file.value = f || null;
};

const downloadTemplate = async () => {
  downloadingTemplate.value = true;
  try {
    const res = await StudentService.downloadStudentImportTemplate();
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-importar-estudiantes.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'No se pudo descargar la plantilla',
      text: e?.response?.data?.message || 'Compruebe su sesión e intente de nuevo.',
    });
  } finally {
    downloadingTemplate.value = false;
  }
};

const sendFile = async () => {
  if (!file.value) {
    Swal.fire({ icon: 'warning', title: 'Seleccione un archivo' });
    return;
  }

  importing.value = true;
  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const { data } = await StudentService.importStudents(formData);
    if (data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Importación completada',
        text: data.message || 'Los datos se procesaron correctamente.',
      });
      closeModal();
      emit('updateData');
    }
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.file?.[0] ||
      'Revise el formato del Excel o contacte al administrador.';
    Swal.fire({
      icon: 'error',
      title: 'Error al importar',
      text: typeof msg === 'string' ? msg : 'No se pudo completar la importación.',
    });
  } finally {
    importing.value = false;
  }
};

const closeModal = () => {
  emit('update:isOpenModal', false);
};
</script>

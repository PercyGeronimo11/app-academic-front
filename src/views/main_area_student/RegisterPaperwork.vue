<template>
  <CContainer fluid class="px-2 px-md-3">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <h4 class="fw-bold text-primary mb-2 d-flex align-items-center">
              <i class="fas fa-file-signature me-2"></i>
              Registrar trámite
            </h4>
            <p class="mb-0 text-body-secondary small">
              Complete el formulario FUT para enviar su solicitud a mesa de partes.
            </p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-4 px-3 px-md-4">
            <PaperworkForm
              validate-on-mount
              @create-paperwork="createPaperwork"
              @cancel="goToMyPaperworks"
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import PaperworkForm from '@/components/paperworks/PaperworkForm.vue';
import PaperworkService from '@/services/PaperworkService';

const router = useRouter();

const goToMyPaperworks = () => {
  router.push('/myPaperworks');
};

const createPaperwork = async (formData) => {
  try {
    const response = await PaperworkService.createPaperwork(formData);
    const payload = response.data;
    if (payload.success) {
      await Swal.fire('Registrado', payload.message || 'Trámite registrado correctamente.', 'success');
      goToMyPaperworks();
    } else {
      Swal.fire('Error', payload.message || 'No se pudo registrar.', 'error');
    }
  } catch (e) {
    Swal.fire('Error', e.response?.data?.message || 'No se pudo registrar el trámite.', 'error');
  }
};
</script>

<template>
  <CCard class="shadow border-0">
    <CCardHeader class="bg-primary text-white text-center">
      <strong>Perfil del docente</strong>
    </CCardHeader>

    <CCardBody>
      <CContainer v-if="teacherData">
        <div class="text-center mb-4">
          <h4 class="mb-1">
            {{ teacherData.name }} {{ teacherData.surname_father }} {{ teacherData.surname_mother }}
          </h4>
          <small class="text-muted">{{ teacherData.email }}</small>
        </div>

        <CRow class="g-3 mb-4">
          <CCol xs="12" md="4">
            <div class="info-box">
              <label>DNI</label>
              <p>{{ teacherData.dni }}</p>
            </div>
          </CCol>

          <CCol xs="12" md="4">
            <div class="info-box">
              <label>Fecha de nacimiento</label>
              <p>{{ teacherData.birth_date }}</p>
            </div>
          </CCol>

          <CCol xs="12" md="4">
            <div class="info-box">
              <label>Teléfono</label>
              <p>{{ teacherData.phone }}</p>
            </div>
          </CCol>

          <CCol xs="12" md="6">
            <div class="info-box">
              <label>Título académico</label>
              <p>{{ teacherData.academic_degree }}</p>
            </div>
          </CCol>
        </CRow>

        <CCard class="mb-4 shadow-sm border-0">
          <CCardHeader class="bg-dark text-white">
            Editar información
          </CCardHeader>

          <CCardBody>
            <CRow class="g-3">
              <CCol xs="12" md="6">
                <CFormInput v-model="teacherData.address" label="Dirección" />
              </CCol>

              <CCol xs="12" md="6">
                <CFormInput
                  v-model="teacherData.password"
                  type="password"
                  label="Nueva contraseña"
                  placeholder="Dejar vacío para no cambiar"
                  autocomplete="new-password"
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CRow class="mt-3">
          <CCol xs="6">
            <CButton color="light" variant="ghost" @click="$router.back()">
              <i class="cil-arrow-left"></i>
            </CButton>
          </CCol>

          <CCol xs="6">
            <CButton class="w-100" color="primary" @click="submitToEdit">
              Actualizar
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </CCardBody>
  </CCard>
</template>

<script setup>
import TeacherService from '@/services/TeacherService';
import { ref, onMounted } from 'vue';
import { CCard, CCardBody, CCardHeader } from '@coreui/vue';
import { toastError, toastSuccess } from '@/utils/alerts';

const teacherData = ref(null);

const mapProfileRow = (row) => {
  const emailRaw = row?.user?.email ?? '';
  const next = { ...row };
  delete next.user;
  return {
    ...next,
    email: typeof emailRaw === 'string' ? emailRaw : '',
    password: '',
  };
};

const loadProfile = async () => {
  try {
    const response = await TeacherService.getItem();
    teacherData.value = mapProfileRow(response.data.data);
  } catch {
    toastError('No se pudo cargar el perfil');
  }
};

const submitToEdit = async () => {
  try {
    if (!teacherData.value) {
      return;
    }
    const data = {
      address: teacherData.value.address,
    };
    if (teacherData.value.password) {
      data.password = teacherData.value.password;
    }
    await TeacherService.updateItem(data);
    toastSuccess('Datos actualizados correctamente');
    teacherData.value.password = '';
  } catch {
    toastError('Error al actualizar');
  }
};

onMounted(loadProfile);
</script>

<style scoped>
.info-box {
  padding: 0.85rem 1rem;
  background: var(--cui-body-bg, #fff);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}

.info-box label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cui-secondary-color, #6b7280);
  margin-bottom: 0.25rem;
}

.info-box p {
  margin: 0;
  font-weight: 600;
  color: var(--cui-body-color, #212631);
}
</style>

<template>

  <CCard class="shadow border-0">
    <CCardHeader class="bg-primary text-white text-center">
      <strong>Perfil del Administrativo</strong>
    </CCardHeader>

    <CCardBody>

      <CContainer v-if="administrativeData">
        <div class="text-center mb-4">
          <h4 class="mb-1">
            {{ administrativeData.names }} {{ administrativeData.surname_father }} {{ administrativeData.surname_mother }}
          </h4>
          <small class="text-muted">{{ administrativeData.email }}</small>
        </div>

        <!-- 📄 DATOS -->
        <CRow class="g-3 mb-4">
          <CCol xs="12" md="4">
            <div class="info-box">
              <label>DNI</label>
              <p>{{ administrativeData.dni }}</p>
            </div>
          </CCol>

          <CCol xs="12" md="4">
            <div class="info-box">
              <label>Fecha de nacimiento</label>
              <p>{{ administrativeData.birth_date }}</p>
            </div>
          </CCol>

          <CCol xs="12" md="4">
            <div class="info-box">
              <label>Teléfono</label>
              <p>{{ administrativeData.phone_number }}</p>
            </div>
          </CCol>

        </CRow>

        <!-- ✏️ EDITABLE -->
        <CCard class="mb-4 shadow-sm border-0">
          <CCardHeader class="bg-dark text-white">
            Editar información
          </CCardHeader>

          <CCardBody>
            <CRow class="g-3">

              <CCol xs="12" md="6">
                <CFormInput v-model="administrativeData.address" label="Dirección" />
              </CCol>

              <CCol xs="12" md="6">
                <CFormInput v-model="administrativeData.password" type="password" label="Nueva contraseña"
                  placeholder="Dejar vacío para no cambiar" />
              </CCol>

            </CRow>
          </CCardBody>
        </CCard>

        <!-- BOTONES -->
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
import AdministrativeService from '@/services/AdministrativeService'
import { ref, onMounted, watch } from 'vue';
import { CCard, CCardBody, CCardHeader } from "@coreui/vue";
import { toastError, toastWarning, toastSuccess } from "@/utils/alerts";

const administrativeData = ref(null)

const getAdministrativeData = async () => {
  const response = await AdministrativeService.getItem()
  administrativeData.value = response.data.data
}

const submitToEdit = async () => {
  try {
    let data = {
      address: administrativeData.value.address
    }

    if (administrativeData.value.password) {
      data.password = administrativeData.value.password
    }

    await AdministrativeService.updateItem(data)

    toastSuccess('Datos actualizados correctamente')

  } catch (error) {
    toastError('Error al actualizar')
  }
}
 

onMounted(getAdministrativeData)
</script>

<style></style>

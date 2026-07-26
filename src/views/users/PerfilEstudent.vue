<template>

  <CCard class="mb-4 shadow">
    <CCardHeader class="bg-primary text-center text-white">
      <strong>Ver información de alumno</strong>
    </CCardHeader>
    <CCardBody>
      <CForm @submit.prevent="submitToEdit">
        <CContainer>

          <!-- ================= DATOS DEL ESTUDIANTE ================= -->
          <CCard class="mb-4 shadow-sm border-0">
            <CCardHeader class="bg-dark text-white">
              <strong>Datos del Estudiante</strong>
            </CCardHeader>

            <CCardBody>
              <CRow class="g-3">
                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.dni" label="DNI" readonly />
                </CCol>

                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.name" label="Nombres" readonly />
                </CCol>

                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.surname_father" label="Apellido paterno" readonly />
                </CCol>

                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.surname_mother" label="Apellido materno" readonly />
                </CCol>
              </CRow>

              <CRow class="g-3 mt-2">
                <CCol xs="6" md="2">
                  <CFormInput v-model="alumnoData.grade_section.grade" label="Grado" readonly />
                </CCol>

                <CCol xs="6" md="2">
                  <CFormInput v-model="alumnoData.grade_section.section" label="Sección" readonly />
                </CCol>

                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.birth_date" type="date" label="Fecha de nacimiento" readonly />
                </CCol>

                <CCol xs="12" md="3">
                  <CFormSelect v-model="alumnoData.sex" label="Sexo" disabled>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </CFormSelect>
                </CCol>

                <CCol xs="12" md="2" class="d-flex align-items-end">
                  <CButton variant="outline" class="w-100 bg-primary text-white" @click="obtenerQrCode()">
                    Ver QR
                  </CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <!-- ================= APODERADO ================= -->
          <CCard class="mb-4 shadow-sm border-0">
            <CCardHeader class="bg-dark text-white">
              <strong>Datos del apoderado</strong>
            </CCardHeader>

            <CCardBody>
              <CRow class="g-3">
                <CCol xs="12" md="3">
                  <CFormInput v-model="alumnoData.representative_dni" label="DNI" maxlength="8" />
                </CCol>

                <CCol xs="12" md="5">
                  <CFormInput v-model="alumnoData.representative_name" label="Nombre completo" />
                </CCol>

                <CCol xs="12" md="2">
                  <CFormInput
                    v-model="alumnoData.representative_phone"
                    label="Teléfono"
                    maxlength="9"
                    placeholder="Requerido para trámites"
                  />
                </CCol>

                <CCol xs="12" md="2">
                  <CFormInput v-model="alumnoData.representative_relationship" label="Parentesco" />
                </CCol>
              </CRow>

              <CRow class="g-3 mt-1">
                <CCol xs="12">
                  <CFormInput
                    v-model="alumnoData.address"
                    label="Dirección del apoderado"
                    placeholder="Requerida para registrar trámites"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <!-- ================= USUARIO ================= -->
          <CCard class="mb-4 shadow-sm border-0">
            <CCardHeader class="bg-dark text-white">
              <strong>Datos de Usuario</strong>
            </CCardHeader>
            <CCardBody>
              <CRow class="g-3">
                <CCol xs="12" md="6">
                  <CFormInput v-model="alumnoData.user.email" label="Correo electrónico" readonly />
                </CCol>

                <CCol xs="12" md="6">
                  <CFormInput v-model="alumnoData.password" type="password" label="Nueva contraseña"
                    placeholder="Dejar vacío para no cambiarla" />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <!-- BOTONES -->
          <CRow class="mt-4">
            <CCol xs="6">
              <CButton color="light" class="w-100 border" @click="$router.back()">
                Regresar
              </CButton>
            </CCol>

            <CCol xs="6" class="text-end">
              <CButton color="primary" type="submit" class="w-100">
                Guardar cambios
              </CButton>
            </CCol>
          </CRow>

        </CContainer>
      </CForm>
    </CCardBody>
  </CCard>

  <!-- ================= MODAL QR ================= -->
  <CModal :visible="showQRModal" @close="showQRModal = false">
    <CModalHeader class="bg-primary text-white">
      <CModalTitle>QR del Estudiante</CModalTitle>
    </CModalHeader>

    <CModalBody class="text-center">
      <img :src="qrImage" alt="QR" class="img-fluid" />
    </CModalBody>

    <CModalFooter>
      <CButton color="success" @click="downloadQR">
        Descargar QR
      </CButton>
      <CButton color="secondary" @click="showQRModal = false">
        Cerrar
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>

import StudentService from "@/services/StudentService";
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import { CCard, CCardBody, CCardHeader } from "@coreui/vue";
import { toastError, toastSuccess } from "@/utils/alerts";
const URL_DJANGO_MEDIA = import.meta.env.VITE_URL_DJANGO_MEDIA;


const route = useRoute();
const studentId = ref("");
const alumnoData = ref({
  name: "",
  surname_father: "",
  surname_mother: "",
  grade_section_current: "",
  birth_date: "",
  dni: "",
  age: "",
  address: "",
  sex: "",
  representative_dni: "",
  representative_name: "",
  representative_phone: "",
  representative_relationship: "",
  email: "",
  grade_section: {
    grade: '',
    section: ''
  },
  user: {
    name: "",
    email: "",
  },
  password: ""
});
const showQRModal = ref(false)
const qrImage = ref(null)

const downloadQR = async () => {
  const response = await fetch(qrImage.value)
  const blob = await response.blob()

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `qr-${alumnoData.value.dni}.png`
  link.click()

  window.URL.revokeObjectURL(url)
}

const calculateAge = () => {
  if (!alumnoData.value.birth_date) return;

  const birthDate = new Date(alumnoData.value.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  alumnoData.value.age = age;
};

const getDataStudent = async (id) => {
  try {
    const response = await StudentService.getItem(id);
    alumnoData.value = response.data.data;
    if (alumnoData.value.sex !== "M" && alumnoData.value.sex !== "F") {
      alumnoData.value.sex = "M";
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      toastError(error.response.data.message);
    } else {
      console.log("error:" + error);
    }
  }
};

const submitToEdit = async () => {
  const d = alumnoData.value;
  try {
    calculateAge();
    await StudentService.updateItem({
      id: d.id,
      address: d.address,
      representative_dni: d.representative_dni,
      representative_name: d.representative_name,
      representative_phone: d.representative_phone,
      representative_relationship: d.representative_relationship,
      password: d.password || undefined,
    });
    alumnoData.value.password = "";
    toastSuccess("Perfil actualizado correctamente");
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      toastError(error.response.data.message);
    } else {
      toastError("No se pudo actualizar el perfil");
    }
  }
};

const obtenerQrCode = async () => {
  try {
    const response = await StudentService.getPathImageQrCode();
    qrImage.value = `${URL_DJANGO_MEDIA}/${response.data.qr_code}`;
    console.log("QR obtenido:", qrImage.value);
    showQRModal.value = true;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Obtener QR",
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};

onMounted(() => {
  studentId.value = route.params.id;
  getDataStudent(studentId.value);
});
</script>

<style>
.input-group-text {
  background-color: var(--rp-surface-sunken);
  border-left: none;
  font-weight: bold;
}

.form-control {
  border-right: none;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  border-radius: 0.25rem 0 0 0.25rem;
}

.input-group .input-group-text {
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>

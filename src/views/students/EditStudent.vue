<template>

      <CCard class="mb-4 shadow">
        <CCardHeader class="bg-primary text-center text-white">
          <strong>Editar información del alumno</strong>
        </CCardHeader>

        <CCardBody>
          <CForm @submit.prevent="submitToEdit">
            <CContainer>

              <!-- ================= DATOS DEL ESTUDIANTE ================= -->
              <CCard class="mb-4 ">
                <CCardHeader class="bg-dark text-white">
                  <strong>Datos del Estudiante</strong>
                </CCardHeader>

                <CCardBody>
                  <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Identificación</h6>
                  <CRow class="g-3 mb-4">
                    <CCol xs="12" md="4">
                      <CFormInput v-model="alumnoData.dni" label="DNI" required />
                    </CCol>
                    <CCol xs="12" md="4">
                      <CFormInput
                        v-model="alumnoData.student_code"
                        label="Código de estudiante"
                        placeholder="Opcional"
                        maxlength="14"
                      />
                    </CCol>
                  </CRow>

                  <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Nombre completo</h6>
                  <CRow class="g-3 mb-4">
                    <CCol xs="12" md="4">
                      <CFormInput v-model="alumnoData.name" label="Nombres" required />
                    </CCol>
                    <CCol xs="12" md="4">
                      <CFormInput v-model="alumnoData.surname_father" label="Apellido paterno" required />
                    </CCol>
                    <CCol xs="12" md="4">
                      <CFormInput v-model="alumnoData.surname_mother" label="Apellido materno" required />
                    </CCol>
                  </CRow>

                  <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Grado y datos personales</h6>
                  <CRow class="g-3 mb-4 align-items-end">
                    <CCol xs="12" sm="6" md="2">
                      <CFormInput v-model="alumnoData.grade_section.grade" label="Grado" disabled />
                    </CCol>
                    <CCol xs="12" sm="6" md="2">
                      <CFormInput v-model="alumnoData.grade_section.section" label="Sección" disabled />
                    </CCol>
                    <CCol xs="12" sm="6" md="3">
                      <CFormInput v-model="alumnoData.birth_date" type="date" label="Fecha de nacimiento" required />
                    </CCol>
                    <CCol xs="12" sm="6" md="3">
                      <CFormSelect v-model="alumnoData.sex" label="Sexo" required>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </CFormSelect>
                    </CCol>
                    <CCol xs="12" md="2" class="d-flex align-items-end pb-1">
                      <CButton color="info" class="text-white w-100" @click="obtenerQrCode()">
                        Ver QR
                      </CButton>
                    </CCol>
                  </CRow>

                  <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Domicilio</h6>
                  <CRow class="g-3">
                    <CCol xs="12">
                      <CFormInput v-model="alumnoData.address" label="Dirección" placeholder="Opcional" />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
              <!-- ================= DATOS DEL APODERADO ================= -->
              <CCard class="mb-4">
                <CCardHeader class="bg-dark text-white">
                  <strong>Datos del apoderado</strong> <span class="fw-normal small">(opcional)</span>
                </CCardHeader>

                <CCardBody>
                  <CRow class="mb-3">
                    <CCol xs="12" md="6">
                      <CFormInput v-model="alumnoData.representative_dni" label="DNI" />
                    </CCol>

                    <CCol xs="12" md="6">
                      <CFormInput v-model="alumnoData.representative_name" label="Nombre completo" />
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol xs="12" md="6">
                      <CFormInput v-model="alumnoData.representative_phone" label="Teléfono" />
                    </CCol>

                    <CCol xs="12" md="6">
                      <CFormInput v-model="alumnoData.representative_relationship" label="Parentesco" />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>


              <!-- ================= DATOS DE USUARIO ================= -->
              <CCard class="mb-4 ">
                <CCardHeader class="bg-dark text-white">
                  <strong>Datos de Usuario</strong>
                </CCardHeader>

                <CCardBody>
                  <CRow>
                    <CCol xs="12" md="6">
                      <CFormInput
                        v-model="alumnoData.user.email"
                        label="Correo electrónico"
                        readonly
                        text="No se puede modificar el correo del estudiante."
                      />
                    </CCol>

                    <CCol xs="12" md="6">
                      <CFormInput
                        v-model="alumnoData.password"
                        type="password"
                        label="Nueva contraseña"
                        placeholder="Dejar vacío para no cambiar"
                        autocomplete="new-password"
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <!-- BOTONES -->
              <CRow class="mt-4 pt-3 border-top justify-content-between align-items-center g-2">
                <CCol xs="12" sm="auto">
                  <router-link to="/students">
                    <CButton color="secondary" variant="outline">Regresar</CButton>
                  </router-link>
                </CCol>
                <CCol xs="12" sm="auto" class="text-sm-end">
                  <CButton color="primary" type="submit">
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
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import { CCard, CCardBody, CCardHeader } from "@coreui/vue";
const URL_DJANGO_MEDIA = import.meta.env.VITE_URL_DJANGO_MEDIA;


const router = useRouter();
const studentId = ref("");
const alumnoData = ref({
  student_code: "",
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
    seccion: ''
  },
  user: {
    name: "",
    email: "",
  },
  password: ""
});
const showQRModal = ref(false)
const qrImage = ref('https://es.wikipedia.org/wiki/C%C3%B3digo_QR')

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
      Swal.fire({
        icon: "error",
        title: "Error al Actualizar",
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};

const submitToEdit = async () => {
  const d = alumnoData.value;
  if (!String(d.dni || "").trim()) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese el DNI." });
    return;
  }
  if (!String(d.name || "").trim()) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese los nombres." });
    return;
  }
  if (!String(d.surname_father || "").trim() || !String(d.surname_mother || "").trim()) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese apellido paterno y materno." });
    return;
  }
  if (!d.birth_date) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese la fecha de nacimiento." });
    return;
  }
  if (d.sex !== "M" && d.sex !== "F") {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Seleccione el sexo." });
    return;
  }
  try {
    calculateAge();
    await StudentService.updateItem(alumnoData.value);
    await Swal.fire({
      icon: "success",
      title: "Estudiante actualizado",
      text: "Los cambios se guardaron correctamente.",
      confirmButtonText: "Aceptar",
    });
    router.push("/students");
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Actualizar",
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};

const obtenerQrCode = async () => {
  try {
    const idForQr = alumnoData.value.user_id;
    if (idForQr == null || idForQr === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Sin usuario asociado',
        text: 'No hay usuario vinculado para obtener el código QR.',
      });
      return;
    }
    const response = await StudentService.getPathImageQrCode(idForQr);
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
  const route = useRoute();
  studentId.value = route.params.id;
  getDataStudent(studentId.value);
});
</script>

<style>
.input-group-text {
  background-color: #f0f0f0;
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

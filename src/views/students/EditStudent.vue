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
                        label="Código de estudiante *"
                        placeholder="Código SIAGIE"
                        maxlength="14"
                        required
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

              <!-- ================= INFORMACIÓN SOCIAL (ML) ================= -->
              <CCard class="mb-4">
                <CCardHeader class="bg-dark text-white">
                  <strong>Información social para predicción</strong>
                </CCardHeader>
                <CCardBody>
                  <p class="small text-body-secondary mb-3">
                    Estos datos alimentan el modelo de riesgo académico. Puede aplicar el mismo valor a los 4 bimestres
                    o editar un bimestre específico.
                  </p>
                  <CRow class="g-3 mb-3">
                    <CCol xs="12" md="4">
                      <CFormSelect v-model="socialForm.bimester_id" label="Bimestre">
                        <option
                          v-for="item in socialProfiles"
                          :key="item.bimester_id"
                          :value="String(item.bimester_id)"
                        >
                          {{ item.bimester_name || `Bimestre ${item.bimester_number}` }}
                          {{ item.filled ? '' : ' (sin completar)' }}
                        </option>
                      </CFormSelect>
                    </CCol>
                    <CCol xs="12" md="4">
                      <CFormSelect v-model="socialForm.works" label="¿El estudiante trabaja?" required>
                        <option value="">Seleccione</option>
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </CFormSelect>
                    </CCol>
                    <CCol xs="12" md="4">
                      <CFormSelect v-model="socialForm.family_situation" label="Situación familiar" required>
                        <option value="">Seleccione</option>
                        <option value="PADRES">Vive con ambos padres</option>
                        <option value="MADRE">Vive con la madre</option>
                        <option value="PADRE">Vive con el padre</option>
                        <option value="ABUELOS">Vive con abuelos</option>
                        <option value="TIOS">Vive con tíos</option>
                        <option value="OTROS">Otros</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CFormCheck
                    id="apply-social-all"
                    v-model="socialForm.apply_to_all"
                    label="Aplicar estos datos a los 4 bimestres"
                  />
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
                  <CButton color="secondary" variant="outline" type="button" @click="goBack">
                    Regresar
                  </CButton>
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
import { ref, watch, onMounted } from "vue";
import Swal from "sweetalert2";
import { CCard, CCardBody, CCardHeader } from "@coreui/vue";
const URL_DJANGO_MEDIA = import.meta.env.VITE_URL_DJANGO_MEDIA;


const router = useRouter();
const route = useRoute();
const studentId = ref("");
const alumnoData = ref({
  student_code: "",
  name: "",
  surname_father: "",
  surname_mother: "",
  grade_section_current: "",
  birth_date: "",
  dni: "",
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
const socialProfiles = ref([]);
const socialForm = ref({
  bimester_id: "",
  works: "",
  family_situation: "",
  apply_to_all: true,
});
const showQRModal = ref(false)
const qrImage = ref('https://es.wikipedia.org/wiki/C%C3%B3digo_QR')

const syncSocialFormFromProfiles = () => {
  if (!socialProfiles.value.length) return;
  const selectedId = socialForm.value.bimester_id
    || String(socialProfiles.value[0].bimester_id);
  const current = socialProfiles.value.find(
    (item) => String(item.bimester_id) === String(selectedId)
  ) || socialProfiles.value[0];

  socialForm.value.bimester_id = String(current.bimester_id);
  socialForm.value.works = current.works === null || current.works === undefined
    ? ""
    : String(Boolean(current.works));
  socialForm.value.family_situation = current.family_situation || "";
  const anyFilled = socialProfiles.value.some((item) => item.filled);
  if (!anyFilled) {
    socialForm.value.apply_to_all = true;
  }
};

watch(
  () => socialForm.value.bimester_id,
  () => {
    const current = socialProfiles.value.find(
      (item) => String(item.bimester_id) === String(socialForm.value.bimester_id)
    );
    if (!current) return;
    socialForm.value.works = current.works === null || current.works === undefined
      ? ""
      : String(Boolean(current.works));
    socialForm.value.family_situation = current.family_situation || "";
  }
);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/students");
};

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

const getDataStudent = async (id) => {
  try {
    const response = await StudentService.getItem(id);
    alumnoData.value = response.data.data;
    if (alumnoData.value.sex !== "M" && alumnoData.value.sex !== "F") {
      alumnoData.value.sex = "M";
    }
    socialProfiles.value = Array.isArray(alumnoData.value.social_profiles)
      ? alumnoData.value.social_profiles
      : [];
    syncSocialFormFromProfiles();
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
  if (!String(d.student_code || "").trim()) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese el código de estudiante." });
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
  if (socialForm.value.works === "" || socialForm.value.works === null) {
    if (socialProfiles.value.length) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Indique si el estudiante trabaja o no.",
      });
      return;
    }
  }
  if (!socialForm.value.family_situation && socialProfiles.value.length) {
    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Seleccione la situación familiar.",
    });
    return;
  }
  try {
    const payload = {
      ...alumnoData.value,
    };
    if (socialProfiles.value.length && socialForm.value.works !== "" && socialForm.value.family_situation) {
      payload.social_profile = {
        bimester_id: Number(socialForm.value.bimester_id),
        works: socialForm.value.works === "true",
        family_situation: socialForm.value.family_situation,
        apply_to_all: Boolean(socialForm.value.apply_to_all),
      };
    }
    await StudentService.updateItem(payload);
    await Swal.fire({
      icon: "success",
      title: "Estudiante actualizado",
      text: "Los cambios se guardaron correctamente.",
      confirmButtonText: "Aceptar",
    });
    goBack();
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

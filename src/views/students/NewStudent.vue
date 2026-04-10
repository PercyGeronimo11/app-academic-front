<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="text-center">
          <strong>Nuevo Alumno</strong>
        </CCardHeader>
        <CCardBody>
          <CForm @submit.prevent="submitToCreate()">
            <CContainer>
              <p class="text-body-secondary small mb-3 mb-md-4">
                Complete los datos del estudiante. Los apartados marcados como opcionales pueden dejarse en blanco.
              </p>

              <!-- Identificación -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Identificación</h6>
              <CRow class="g-3 mb-4">
                <CCol xs="12" md="4">
                  <CFormInput
                    v-model="alumnoData.dni"
                    label="DNI"
                    placeholder="Documento de identidad"
                    required
                  />
                </CCol>
                <CCol xs="12" md="4">
                  <CFormInput
                    v-model="alumnoData.student_code"
                    label="Código de estudiante"
                    placeholder="Opcional — matrícula o código interno"
                    maxlength="14"
                  />
                </CCol>
              </CRow>

              <!-- Nombre completo -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Nombre completo</h6>
              <CRow class="g-3 mb-4">
                <CCol xs="12" md="4">
                  <CFormInput
                    v-model="alumnoData.name"
                    label="Nombres"
                    placeholder="Nombres"
                    required
                  />
                </CCol>
                <CCol xs="12" md="4">
                  <CFormInput
                    v-model="alumnoData.surname_father"
                    label="Apellido paterno"
                    placeholder="Apellido paterno"
                    required
                  />
                </CCol>
                <CCol xs="12" md="4">
                  <CFormInput
                    v-model="alumnoData.surname_mother"
                    label="Apellido materno"
                    placeholder="Apellido materno"
                    required
                  />
                </CCol>
              </CRow>

              <!-- Grado y datos personales -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Grado y datos personales</h6>
              <CRow class="g-3 mb-4">
                <CCol xs="12" sm="6" md="3">
                  <CFormSelect
                    v-model="selectedGrade"
                    label="Grado"
                    required
                  >
                    <option disabled value="">Seleccione</option>
                    <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
                  </CFormSelect>
                </CCol>
                <CCol xs="12" sm="6" md="3">
                  <CFormSelect
                    v-model="selectedSection"
                    label="Sección"
                    required
                  >
                    <option disabled value="">Seleccione</option>
                    <option v-for="s in SECTIONS" :key="s" :value="s">{{ s }}</option>
                  </CFormSelect>
                </CCol>
                <CCol xs="12" sm="6" md="3">
                  <CFormInput
                    v-model="alumnoData.birth_date"
                    label="Fecha de nacimiento"
                    type="date"
                    required
                  />
                </CCol>
                <CCol xs="12" sm="6" md="3">
                  <CFormSelect
                    v-model="alumnoData.sex"
                    label="Sexo"
                    aria-label="Sexo del estudiante"
                    required
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              <!-- Acceso al sistema -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">Acceso al sistema</h6>
              <CRow class="g-3 mb-2">
                <CCol xs="12" md="7">
                  <CFormLabel for="email-local">Correo institucional (generado)</CFormLabel>
                  <div class="input-group">
                    <input
                      id="email-local"
                      type="text"
                      class="form-control"
                      :value="generatedEmailLocal"
                      readonly
                      aria-readonly="true"
                    />
                    <span class="input-group-text">@ierp.edu.pe</span>
                  </div>
                  <small class="text-body-secondary d-block mt-1">
                    Primera letra del nombre, apellido paterno completo y primera letra del apellido materno.
                  </small>
                </CCol>
                <CCol xs="12" md="5">
                  <CFormInput
                    v-model="alumnoData.password"
                    label="Contraseña"
                    placeholder="Contraseña de acceso"
                    required
                    autocomplete="new-password"
                  />
                </CCol>
              </CRow>

              <!-- Domicilio -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3 mt-4">Domicilio</h6>
              <CRow class="g-3 mb-4">
                <CCol xs="12">
                  <CFormInput
                    v-model="alumnoData.address"
                    label="Dirección"
                    placeholder="Opcional"
                  />
                </CCol>
              </CRow>

              <!-- Apoderado -->
              <h6 class="text-primary fw-semibold border-bottom pb-2 mb-3">
                Datos del apoderado <span class="text-body-secondary fw-normal small">(opcional)</span>
              </h6>
              <CRow class="g-3 mb-4">
                <CCol xs="12" md="6" lg="3">
                  <CFormInput
                    v-model="alumnoData.representative_dni"
                    label="DNI del apoderado"
                    placeholder="DNI"
                  />
                </CCol>
                <CCol xs="12" md="6" lg="3">
                  <CFormInput
                    v-model="alumnoData.representative_name"
                    label="Nombre completo"
                    placeholder="Nombre del apoderado"
                  />
                </CCol>
                <CCol xs="12" md="6" lg="3">
                  <CFormInput
                    v-model="alumnoData.representative_phone"
                    label="Teléfono"
                    placeholder="Teléfono"
                  />
                </CCol>
                <CCol xs="12" md="6" lg="3">
                  <CFormInput
                    v-model="alumnoData.representative_relationship"
                    label="Parentesco"
                    placeholder="Parentesco"
                  />
                </CCol>
              </CRow>
              <CRow class="mt-4 pt-3 border-top justify-content-between align-items-center g-2">
                <CCol xs="12" sm="auto">
                  <router-link to="/students">
                    <CButton color="secondary" variant="outline">Cancelar</CButton>
                  </router-link>
                </CCol>
                <CCol xs="12" sm="auto" class="text-sm-end">
                  <CButton color="primary" type="submit">
                    Registrar estudiante
                  </CButton>
                </CCol>
              </CRow>
            </CContainer>
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import StudentService from "@/services/StudentService";
import GradeSectionService from "@/services/GradeSectionService";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";
import Swal from "sweetalert2";

const router = useRouter();
const gradeSections = ref([]);

/** Opciones fijas; el id real se obtiene al combinar con la tabla `grade_sections` */
const GRADES = ["1", "2", "3", "4", "5"];
const SECTIONS = ["A", "B", "C", "D"];

const selectedGrade = ref("1");
const selectedSection = ref("A");

const alumnoData = ref({
  student_code: "",
  name: "",
  surname_father: "",
  surname_mother: "",
  birth_date: "",
  dni: "",
  age: "",
  address: "",
  sex: "M",
  representative_dni: "",
  representative_name: "",
  representative_phone: "",
  representative_relationship: "",
  email: "",
  password: "",
});

/** Quita tildes y deja solo letras minúsculas para el correo */
function normalizeLetters(s) {
  if (!s || typeof s !== "string") return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** Primera letra del nombre (primera palabra) */
function firstLetterName(name) {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  const n = normalizeLetters(first);
  return n.charAt(0) || "";
}

const generatedEmailLocal = computed(() => {
  const fn = firstLetterName(alumnoData.value.name);
  const father = normalizeLetters(alumnoData.value.surname_father || "");
  const motherFirst = normalizeLetters(
    String(alumnoData.value.surname_mother || "").charAt(0) || ""
  );
  return `${fn}${father}${motherFirst}`.slice(0, 64);
});

watch(generatedEmailLocal, (v) => {
  alumnoData.value.email = v;
}, { immediate: true });

function resolveGradeSectionId() {
  const g = String(selectedGrade.value || "").trim();
  const s = String(selectedSection.value || "").trim().toUpperCase();
  if (!g || !s) {
    return null;
  }
  const row = gradeSections.value.find(
    (gs) =>
      String(gs.grade).trim() === g &&
      String(gs.section).trim().toUpperCase() === s
  );
  return row ? Number(row.id) : null;
}

onMounted(async () => {
  try {
    const res = await GradeSectionService.getGradeSections();
    gradeSections.value = res.data.data || [];
  } catch (e) {
    console.error(e);
    Swal.fire({
      icon: "error",
      title: "No se cargaron aulas",
      text: "No se pudo obtener la lista de grados y secciones.",
    });
  }
});

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

const submitToCreate = async () => {
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
  if (!String(d.password || "").trim()) {
    Swal.fire({ icon: "warning", title: "Datos incompletos", text: "Ingrese una contraseña." });
    return;
  }
  if (!selectedGrade.value || !selectedSection.value) {
    Swal.fire({
      icon: "warning",
      title: "Datos incompletos",
      text: "Seleccione grado y sección.",
    });
    return;
  }
  const gradeSectionId = resolveGradeSectionId();
  if (gradeSectionId == null) {
    Swal.fire({
      icon: "error",
      title: "Aula no disponible",
      text: "La combinación grado/sección no existe en el sistema. Compruebe que en administración existan todas las aulas de 1 al 5 y secciones A a D.",
    });
    return;
  }
  if (!generatedEmailLocal.value) {
    Swal.fire({
      icon: "warning",
      title: "Correo no generado",
      text: "Complete nombres y apellidos para generar el correo institucional.",
    });
    return;
  }
  try {
    calculateAge();
    const payload = {
      ...alumnoData.value,
      grade_section_id: gradeSectionId,
      email: generatedEmailLocal.value,
    };
    await StudentService.createItem(payload);
    await Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "Alumno registrado con éxito.",
    });
    router.push("/students");
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};

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

.input-group .form-control[readonly] {
  background-color: var(--cui-tertiary-bg, #e9ecef);
}

.input-group .input-group-text {
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>

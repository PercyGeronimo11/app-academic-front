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
              <CFormLabel><strong>Datos del Estudiante: </strong> </CFormLabel>
              <CRow class="mb-4">
                <CCol>
                  <CFormInput
                    v-model="alumnoData.dni"
                    label="DNI"
                    placeholder="Documento de identidad"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.name"
                    label="Nombres"
                    placeholder="Nombre"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.surname_father"
                    label="Apellido paterno"
                    placeholder="Apellido paterno"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.surname_mother"
                    label="Apellido materno"
                    placeholder="Apellido materno"
                    required
                  />
                </CCol>
              </CRow>
              <CRow class="mb-4">
                <CCol>
                  <CFormLabel for="email">Email</CFormLabel>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="nombre"
                      v-model="alumnoData.email"
                      @input="updateEmail"
                      required
                    />
                    <span class="input-group-text">@ierp.edu.pe</span>
                    <!-- Parte fija con el dominio -->
                  </div>
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.password"
                    label="Contraseña"
                    placeholder="password"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.grade_section_current"
                    label="Grado y sección"
                    placeholder="1° - A"
                    required
                    disabled
                  />
                </CCol>
              </CRow>
              <CRow class="mb-3">
                <CCol>
                  <CFormInput
                    v-model="alumnoData.address"
                    label="Dirección"
                    placeholder="Dirección"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.birth_date"
                    label="Fecha de nacimiento"
                    type="date"
                    required
                  />
                </CCol>
                <CCol>
                  <CFormLabel for="exampleFormControlInput1">Sexo</CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    v-model="alumnoData.sex"
                  >
                    <option disabled value="0">Seleccionar una opción</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow class="mb-4">
                <CFormLabel><strong>Datos del Apoderado </strong> </CFormLabel>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.representative_dni"
                    label="Dni"
                    placeholder="Dni..."
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.representative_name"
                    label="Nombre completo"
                    placeholder="Nombre..."
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.representative_phone"
                    label="Telefono"
                    placeholder="telefono..."
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    v-model="alumnoData.representative_relationship"
                    label="Parentesco"
                    placeholder="parentesco..."
                    required
                  />
                </CCol>
              </CRow>
              <CRow class="mt-3 justify-content-end">
                <CCol>
                  <router-link to="/students" class="CButton" color="info text-white">
                    <CButton color="secondary">Cancelar</CButton>
                  </router-link>
                </CCol>
                <CCol>
                  <CButton class="mx-5" color="primary" @click="submitToCreate()">
                    Registrar
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
import { ref, onMounted, watch } from "vue";
import Swal from "sweetalert2";
const alumnos = ref([]);
var searchData = ref("");
const alumnoData = ref({
  name: "",
  surname_father: "",
  surname_mother: "",
  grade_section_current: "",
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

onMounted(async () => {});

const clearData = () => {
  alumnoData.value = {
    name: "",
    surname_father: "",
    surname_mother: "",
    birth_date: "",
    dni: "",
    sex: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    academic_degree: "",
  };
};

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
  try {
    calculateAge();
    $response= await StudentService.createItem(alumnoData.value);
    if($response.data.status==200){
        this.$router.push("/students"); 
    }else{
        Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: "Error en el servidor",
      });
    }

  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
};

const backToIndex = () => {
  this.$router.push("/students");
};

watch(searchData, (newVal) => {
  listStudentService(newVal);
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

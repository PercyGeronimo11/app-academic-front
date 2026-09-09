<template>
  <div class="module-page student-edit">
    <section class="profile-hero mb-4">
      <div class="profile-hero__intro">
        <div class="profile-hero__main">
          <h1 class="profile-hero__title">
            <i class="fas fa-user-graduate" aria-hidden="true"></i>
            Editar estudiante
          </h1>
          <p class="profile-hero__subtitle">
            Actualice la información académica, social, del apoderado y la cuenta de acceso.
          </p>
        </div>
        <CButton color="primary" class="profile-hero__qr" type="button" @click="obtenerQrCode">
          <i class="fas fa-qrcode me-2" aria-hidden="true"></i>
          Ver QR
        </CButton>
      </div>
    </section>

    <CForm @submit.prevent="submitToEdit">
      <!-- Datos del estudiante -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">Datos del estudiante</div>
        <div class="profile-panel__body">
          <h3 class="student-edit__block-title">Identificación y nombre completo</h3>
          <div class="student-edit__identity-grid mb-4">
            <div class="profile-field">
              <CFormLabel for="stu-dni">DNI</CFormLabel>
              <CFormInput id="stu-dni" v-model="alumnoData.dni" required />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-code">Código de estudiante *</CFormLabel>
              <CFormInput
                id="stu-code"
                v-model="alumnoData.student_code"
                placeholder="Código SIAGIE"
                maxlength="14"
                required
              />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-name">Nombres</CFormLabel>
              <CFormInput id="stu-name" v-model="alumnoData.name" required />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-surname-f">Apellido paterno</CFormLabel>
              <CFormInput id="stu-surname-f" v-model="alumnoData.surname_father" required />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-surname-m">Apellido materno</CFormLabel>
              <CFormInput id="stu-surname-m" v-model="alumnoData.surname_mother" required />
            </div>
          </div>

          <h3 class="student-edit__block-title">Grado y datos personales</h3>
          <div class="student-edit__personal-grid mb-0">
            <div class="profile-field student-edit__col-grado">
              <CFormLabel for="stu-aula">Grado / Sección</CFormLabel>
              <CFormInput id="stu-aula" :model-value="aulaLabel" disabled />
            </div>
            <div class="profile-field student-edit__col-fecha">
              <CFormLabel for="stu-birth">Fecha de nacimiento</CFormLabel>
              <CFormInput id="stu-birth" v-model="alumnoData.birth_date" type="date" required />
            </div>
            <div class="profile-field student-edit__col-sexo">
              <CFormLabel for="stu-sex">Sexo</CFormLabel>
              <CFormSelect id="stu-sex" v-model="alumnoData.sex" required>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </CFormSelect>
            </div>
            <div class="profile-field student-edit__col-dir">
              <CFormLabel for="stu-address">Dirección</CFormLabel>
              <CFormInput id="stu-address" v-model="alumnoData.address" placeholder="Opcional" />
            </div>
          </div>
        </div>
      </section>

      <!-- Información social -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Información social para predicción
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">
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
        </div>
      </section>

      <!-- Apoderado -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Datos del apoderado
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">Opcional, pero recomendado para trámites.</p>
          <div class="profile-form-grid profile-form-grid--apoderado">
            <div class="profile-field profile-field--dni">
              <CFormLabel for="rep-dni">DNI del apoderado</CFormLabel>
              <CFormInput
                id="rep-dni"
                v-model="alumnoData.representative_dni"
                maxlength="8"
                placeholder="12345678"
              />
            </div>
            <div class="profile-field profile-field--name">
              <CFormLabel for="rep-name">Nombre completo</CFormLabel>
              <CFormInput
                id="rep-name"
                v-model="alumnoData.representative_name"
                placeholder="Nombre del apoderado"
              />
            </div>
            <div class="profile-field profile-field--rel">
              <CFormLabel for="rep-rel">Parentesco</CFormLabel>
              <CFormSelect id="rep-rel" v-model="alumnoData.representative_relationship">
                <option value="">Seleccione</option>
                <option
                  v-for="option in relationshipOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </CFormSelect>
            </div>
            <div class="profile-field profile-field--phone">
              <CFormLabel for="rep-phone">Teléfono</CFormLabel>
              <CFormInput
                id="rep-phone"
                v-model="alumnoData.representative_phone"
                maxlength="9"
                placeholder="999999999"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Usuario -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">Datos de usuario</div>
        <div class="profile-panel__body">
          <CRow class="g-3">
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
        </div>
      </section>

      <div class="profile-actions">
        <CButton color="secondary" variant="outline" class="profile-actions__back" type="button" @click="goBack">
          Regresar
        </CButton>
        <CButton color="primary" class="profile-actions__save" type="submit">
          Guardar cambios
        </CButton>
      </div>
    </CForm>

    <CModal :visible="showQRModal" alignment="center" @close="showQRModal = false">
      <CModalHeader class="bg-primary text-white border-0">
        <CModalTitle>QR del estudiante</CModalTitle>
      </CModalHeader>
      <CModalBody class="text-center">
        <img v-if="qrImage" :src="qrImage" alt="Código QR del estudiante" class="student-edit__qr" />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="showQRModal = false">Cerrar</CButton>
        <CButton color="primary" :disabled="!qrImage" @click="downloadQR">Descargar QR</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import StudentService from '@/services/StudentService';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { BRAND_COLOR } from '@/utils/brand';

const URL_DJANGO_MEDIA = import.meta.env.VITE_URL_DJANGO_MEDIA;

const RELATIONSHIP_OPTIONS = [
  'Padre',
  'Madre',
  'Tutor',
  'Tío',
  'Tía',
  'Abuelo',
  'Abuela',
  'Hermano',
  'Hermana',
  'Otro',
];

const router = useRouter();
const route = useRoute();
const studentId = ref('');
const alumnoData = ref({
  student_code: '',
  name: '',
  surname_father: '',
  surname_mother: '',
  grade_section_current: '',
  birth_date: '',
  dni: '',
  address: '',
  sex: '',
  representative_dni: '',
  representative_name: '',
  representative_phone: '',
  representative_relationship: '',
  email: '',
  grade_section: {
    grade: '',
    section: '',
  },
  user: {
    name: '',
    email: '',
  },
  password: '',
});
const socialProfiles = ref([]);
const socialForm = ref({
  bimester_id: '',
  works: '',
  family_situation: '',
  apply_to_all: true,
});
const showQRModal = ref(false);
const qrImage = ref(null);

const aulaLabel = computed(() => {
  const grade = alumnoData.value?.grade_section?.grade || '';
  const section = alumnoData.value?.grade_section?.section || '';
  if (!grade && !section) return '—';
  return `${grade || '—'}° ${section || '—'}`.trim();
});

const relationshipOptions = computed(() => {
  const current = String(alumnoData.value.representative_relationship || '').trim();
  if (current && !RELATIONSHIP_OPTIONS.includes(current)) {
    return [current, ...RELATIONSHIP_OPTIONS];
  }
  return RELATIONSHIP_OPTIONS;
});

const syncSocialFormFromProfiles = () => {
  if (!socialProfiles.value.length) return;
  const selectedId = socialForm.value.bimester_id
    || String(socialProfiles.value[0].bimester_id);
  const current = socialProfiles.value.find(
    (item) => String(item.bimester_id) === String(selectedId),
  ) || socialProfiles.value[0];

  socialForm.value.bimester_id = String(current.bimester_id);
  socialForm.value.works = current.works === null || current.works === undefined
    ? ''
    : String(Boolean(current.works));
  socialForm.value.family_situation = current.family_situation || '';
  const anyFilled = socialProfiles.value.some((item) => item.filled);
  if (!anyFilled) {
    socialForm.value.apply_to_all = true;
  }
};

watch(
  () => socialForm.value.bimester_id,
  () => {
    const current = socialProfiles.value.find(
      (item) => String(item.bimester_id) === String(socialForm.value.bimester_id),
    );
    if (!current) return;
    socialForm.value.works = current.works === null || current.works === undefined
      ? ''
      : String(Boolean(current.works));
    socialForm.value.family_situation = current.family_situation || '';
  },
);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/students');
};

const downloadQR = async () => {
  if (!qrImage.value) return;
  const response = await fetch(qrImage.value);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `qr-${alumnoData.value.dni || alumnoData.value.id}.png`;
  link.click();
  window.URL.revokeObjectURL(url);
};

const getDataStudent = async (id) => {
  try {
    const response = await StudentService.getItem(id);
    const data = response.data.data;
    alumnoData.value = {
      ...alumnoData.value,
      ...data,
      grade_section: {
        grade: data.grade_section?.grade || '',
        section: data.grade_section?.section || '',
      },
      user: {
        name: data.user?.name || '',
        email: data.user?.email || '',
      },
      password: '',
      representative_relationship: data.representative_relationship || '',
    };
    if (alumnoData.value.sex !== 'M' && alumnoData.value.sex !== 'F') {
      alumnoData.value.sex = 'M';
    }
    socialProfiles.value = Array.isArray(data.social_profiles) ? data.social_profiles : [];
    syncSocialFormFromProfiles();
  } catch (error) {
    if (error.response?.data?.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: error.response.data.message,
        confirmButtonColor: BRAND_COLOR,
      });
    } else {
      console.log('error:' + error);
    }
  }
};

const submitToEdit = async () => {
  const d = alumnoData.value;
  if (!String(d.dni || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese el DNI.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (!String(d.student_code || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese el código de estudiante.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (!String(d.name || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese los nombres.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (!String(d.surname_father || '').trim() || !String(d.surname_mother || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese apellido paterno y materno.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (!d.birth_date) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese la fecha de nacimiento.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (d.sex !== 'M' && d.sex !== 'F') {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Seleccione el sexo.', confirmButtonColor: BRAND_COLOR });
    return;
  }
  if (socialForm.value.works === '' || socialForm.value.works === null) {
    if (socialProfiles.value.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Indique si el estudiante trabaja o no.',
        confirmButtonColor: BRAND_COLOR,
      });
      return;
    }
  }
  if (!socialForm.value.family_situation && socialProfiles.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Seleccione la situación familiar.',
      confirmButtonColor: BRAND_COLOR,
    });
    return;
  }
  try {
    const payload = {
      ...alumnoData.value,
    };
    if (socialProfiles.value.length && socialForm.value.works !== '' && socialForm.value.family_situation) {
      payload.social_profile = {
        bimester_id: Number(socialForm.value.bimester_id),
        works: socialForm.value.works === 'true',
        family_situation: socialForm.value.family_situation,
        apply_to_all: Boolean(socialForm.value.apply_to_all),
      };
    }
    await StudentService.updateItem(payload);
    await Swal.fire({
      icon: 'success',
      title: 'Estudiante actualizado',
      text: 'Los cambios se guardaron correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: BRAND_COLOR,
    });
    goBack();
  } catch (error) {
    if (error.response?.data?.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar',
        text: error.response.data.message,
        confirmButtonColor: BRAND_COLOR,
      });
    } else {
      console.log('error:' + error);
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
        confirmButtonColor: BRAND_COLOR,
      });
      return;
    }
    const response = await StudentService.getPathImageQrCode(idForQr);
    qrImage.value = `${URL_DJANGO_MEDIA}/${response.data.qr_code}`;
    showQRModal.value = true;
  } catch (error) {
    if (error.response?.data?.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Obtener QR',
        text: error.response.data.message,
        confirmButtonColor: BRAND_COLOR,
      });
    } else {
      console.log('error:' + error);
    }
  }
};

onMounted(() => {
  studentId.value = route.params.id;
  getDataStudent(studentId.value);
});
</script>

<style scoped>
.student-edit {
  max-width: 100%;
}

.profile-hero,
.profile-panel {
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius-lg);
  box-shadow: var(--rp-shadow-sm);
  overflow: hidden;
}

.profile-hero__intro {
  padding: var(--rp-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-3);
}

.profile-hero__main {
  min-width: 0;
  flex: 1;
}

.profile-hero__title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-bold);
  color: var(--rp-brand-500);
  line-height: var(--rp-leading-tight);
}

.profile-hero__subtitle {
  margin: var(--rp-space-2) 0 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
  max-width: 42rem;
}

.profile-hero__qr {
  min-height: 44px;
  width: 100%;
}

.student-edit__identity-grid,
.student-edit__personal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-3);
}

.profile-section-bar {
  padding: var(--rp-space-3) var(--rp-space-4);
  background: var(--rp-brand-400);
  color: #fff;
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: var(--rp-tracking-wide);
  text-transform: uppercase;
}

.profile-panel__body {
  padding: var(--rp-space-4);
}

.profile-section-hint {
  margin: 0 0 var(--rp-space-4);
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-normal);
}

.student-edit__block-title {
  margin: 0 0 var(--rp-space-3);
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-brand-600);
  border-bottom: 1px solid var(--rp-border-subtle);
  padding-bottom: var(--rp-space-2);
}

.profile-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-3);
}

.profile-field {
  min-width: 0;
}

.profile-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--rp-space-3);
}

.profile-actions__back,
.profile-actions__save {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  min-height: 44px;
}

.student-edit__qr {
  max-width: min(100%, 16rem);
  height: auto;
}

@media (min-width: 768px) {
  .profile-hero__intro,
  .profile-panel__body {
    padding: var(--rp-space-5);
  }

  .profile-hero__intro {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .profile-hero__qr {
    width: auto;
    flex-shrink: 0;
  }

  .profile-section-bar {
    padding: var(--rp-space-3) var(--rp-space-5);
  }

  .profile-hero__title {
    font-size: var(--rp-text-xl);
  }

  .student-edit__identity-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .student-edit__personal-grid {
    grid-template-columns: repeat(16, minmax(0, 1fr));
  }

  .student-edit__col-grado {
    grid-column: span 2;
  }

  .student-edit__col-fecha {
    grid-column: span 4;
  }

  .student-edit__col-sexo {
    grid-column: span 4;
  }

  .student-edit__col-dir {
    grid-column: span 6;
  }

  .profile-form-grid--apoderado {
    grid-template-columns: 8rem minmax(0, 1fr) 10rem;
  }

  .profile-field--phone {
    grid-column: 1 / -1;
  }

  .profile-actions__back {
    flex: 0 0 auto;
    min-width: 8rem;
  }

  .profile-actions__save {
    flex: 0 0 auto;
    min-width: 12rem;
  }
}

@media (min-width: 992px) {
  .profile-form-grid--apoderado {
    grid-template-columns: 8rem minmax(0, 1.4fr) 10rem 9rem;
  }

  .profile-field--phone {
    grid-column: auto;
  }
}
</style>

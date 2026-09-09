<template>
  <div class="module-page student-new">
    <section class="profile-hero mb-4">
      <div class="profile-hero__intro">
        <div class="profile-hero__main">
          <h1 class="profile-hero__title">
            <i class="fas fa-user-graduate" aria-hidden="true"></i>
            Nuevo estudiante
          </h1>
          <p class="profile-hero__subtitle">
            Complete los datos del estudiante. Los apartados opcionales pueden dejarse en blanco.
          </p>
        </div>
      </div>
    </section>

    <CForm @submit.prevent="submitToCreate">
      <!-- Datos del estudiante -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">Datos del estudiante</div>
        <div class="profile-panel__body">
          <h3 class="student-new__block-title">Identificación y nombre completo</h3>
          <div class="student-new__identity-grid mb-4">
            <div class="profile-field">
              <CFormLabel for="stu-dni">DNI</CFormLabel>
              <CFormInput
                id="stu-dni"
                v-model="alumnoData.dni"
                placeholder="Documento de identidad"
                maxlength="8"
                required
              />
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
              <CFormInput
                id="stu-name"
                v-model="alumnoData.name"
                placeholder="Nombres"
                required
              />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-surname-f">Apellido paterno</CFormLabel>
              <CFormInput
                id="stu-surname-f"
                v-model="alumnoData.surname_father"
                placeholder="Apellido paterno"
                required
              />
            </div>
            <div class="profile-field">
              <CFormLabel for="stu-surname-m">Apellido materno</CFormLabel>
              <CFormInput
                id="stu-surname-m"
                v-model="alumnoData.surname_mother"
                placeholder="Apellido materno"
                required
              />
            </div>
          </div>

          <h3 class="student-new__block-title">Grado y datos personales</h3>
          <div class="student-new__personal-grid mb-0">
            <div class="profile-field student-new__col-grado">
              <CFormLabel for="stu-grade">Grado</CFormLabel>
              <CFormSelect id="stu-grade" v-model="selectedGrade" required>
                <option disabled value="">Seleccione</option>
                <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
              </CFormSelect>
            </div>
            <div class="profile-field student-new__col-section">
              <CFormLabel for="stu-section">Sección</CFormLabel>
              <CFormSelect id="stu-section" v-model="selectedSection" required>
                <option disabled value="">Seleccione</option>
                <option v-for="s in SECTIONS" :key="s" :value="s">{{ s }}</option>
              </CFormSelect>
            </div>
            <div class="profile-field student-new__col-fecha">
              <CFormLabel for="stu-birth">Fecha de nacimiento</CFormLabel>
              <CFormInput
                id="stu-birth"
                v-model="alumnoData.birth_date"
                type="date"
                required
              />
            </div>
            <div class="profile-field student-new__col-sexo">
              <CFormLabel for="stu-sex">Sexo</CFormLabel>
              <CFormSelect id="stu-sex" v-model="alumnoData.sex" required>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </CFormSelect>
            </div>
            <div class="profile-field student-new__col-dir">
              <CFormLabel for="stu-address">Dirección</CFormLabel>
              <CFormInput
                id="stu-address"
                v-model="alumnoData.address"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Información social (opcional) -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Información social para predicción
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">
            Opcional. Estos datos alimentan el modelo de riesgo académico. Puede aplicar el mismo valor
            a los 4 bimestres o editar un bimestre específico.
          </p>
          <CRow class="g-3 mb-3">
            <CCol xs="12" md="4">
              <CFormSelect
                v-model="socialForm.bimester_id"
                label="Bimestre"
                :disabled="!socialBimesters.length"
              >
                <option v-if="!socialBimesters.length" value="">Sin bimestres configurados</option>
                <option
                  v-for="item in socialBimesters"
                  :key="item.id"
                  :value="String(item.id)"
                >
                  {{ item.name || `Bimestre ${item.number}` }}
                </option>
              </CFormSelect>
            </CCol>
            <CCol xs="12" md="4">
              <CFormSelect v-model="socialForm.works" label="¿El estudiante trabaja?">
                <option value="">Seleccione</option>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </CFormSelect>
            </CCol>
            <CCol xs="12" md="4">
              <CFormSelect v-model="socialForm.family_situation" label="Situación familiar">
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
            id="apply-social-all-new"
            v-model="socialForm.apply_to_all"
            label="Aplicar estos datos a los 4 bimestres"
          />
        </div>
      </section>

      <!-- Apoderado -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">Datos del apoderado</div>
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
                  v-for="option in RELATIONSHIP_OPTIONS"
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

      <!-- Acceso -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">Acceso al sistema</div>
        <div class="profile-panel__body">
          <CRow class="g-3">
            <CCol xs="12" md="7">
              <CFormLabel for="email-local">Correo institucional (generado)</CFormLabel>
              <div class="student-new__email-group">
                <input
                  id="email-local"
                  type="text"
                  class="form-control"
                  :value="generatedEmailLocal"
                  readonly
                  aria-readonly="true"
                />
                <span class="student-new__email-suffix">@ierp.edu.pe</span>
              </div>
              <small class="profile-section-hint d-block mt-2 mb-0">
                Primera letra del nombre, apellido paterno completo y primera letra del apellido materno.
              </small>
            </CCol>
            <CCol xs="12" md="5">
              <CFormLabel for="stu-password">Contraseña</CFormLabel>
              <CFormInput
                id="stu-password"
                v-model="alumnoData.password"
                type="password"
                placeholder="Contraseña de acceso"
                required
                autocomplete="new-password"
              />
            </CCol>
          </CRow>
        </div>
      </section>

      <div class="profile-actions">
        <CButton
          color="secondary"
          variant="outline"
          class="profile-actions__back"
          type="button"
          @click="goBack"
        >
          Cancelar
        </CButton>
        <CButton color="primary" class="profile-actions__save" type="submit">
          Registrar estudiante
        </CButton>
      </div>
    </CForm>
  </div>
</template>

<script setup>
import StudentService from '@/services/StudentService';
import GradeSectionService from '@/services/GradeSectionService';
import BimesterService from '@/services/BimesterService';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';

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
const gradeSections = ref([]);
const socialBimesters = ref([]);

/** Opciones fijas; el id real se obtiene al combinar con la tabla `grade_sections` */
const GRADES = ['1', '2', '3', '4', '5'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const selectedGrade = ref('1');
const selectedSection = ref('A');

const socialForm = ref({
  bimester_id: '',
  works: '',
  family_situation: '',
  apply_to_all: true,
});

const alumnoData = ref({
  student_code: '',
  name: '',
  surname_father: '',
  surname_mother: '',
  birth_date: '',
  dni: '',
  address: '',
  sex: 'M',
  representative_dni: '',
  representative_name: '',
  representative_phone: '',
  representative_relationship: '',
  email: '',
  password: '',
});

/** Quita tildes y deja solo letras minúsculas para el correo */
function normalizeLetters(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** Primera letra del nombre (primera palabra) */
function firstLetterName(name) {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  const n = normalizeLetters(first);
  return n.charAt(0) || '';
}

const generatedEmailLocal = computed(() => {
  const fn = firstLetterName(alumnoData.value.name);
  const father = normalizeLetters(alumnoData.value.surname_father || '');
  const motherFirst = normalizeLetters(
    String(alumnoData.value.surname_mother || '').charAt(0) || '',
  );
  return `${fn}${father}${motherFirst}`.slice(0, 64);
});

const hasPartialSocial = computed(() => {
  const hasWorks = socialForm.value.works !== '' && socialForm.value.works !== null;
  const hasFamily = Boolean(socialForm.value.family_situation);
  return (hasWorks && !hasFamily) || (!hasWorks && hasFamily);
});

const hasCompleteSocial = computed(() => {
  const hasWorks = socialForm.value.works !== '' && socialForm.value.works !== null;
  const hasFamily = Boolean(socialForm.value.family_situation);
  return hasWorks && hasFamily && Boolean(socialForm.value.bimester_id);
});

watch(generatedEmailLocal, (v) => {
  alumnoData.value.email = v;
}, { immediate: true });

function resolveGradeSectionId() {
  const g = String(selectedGrade.value || '').trim();
  const s = String(selectedSection.value || '').trim().toUpperCase();
  if (!g || !s) {
    return null;
  }
  const row = gradeSections.value.find(
    (gs) =>
      String(gs.grade).trim() === g &&
      String(gs.section).trim().toUpperCase() === s,
  );
  return row ? Number(row.id) : null;
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push('/students');
};

async function loadSocialBimesters() {
  try {
    const res = await BimesterService.list();
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    if (!list.length) {
      socialBimesters.value = [];
      return;
    }
    const years = list.map((b) => Number(b.year)).filter((y) => !Number.isNaN(y));
    const latestYear = years.length ? Math.max(...years) : null;
    const filtered = latestYear == null
      ? list
      : list.filter((b) => Number(b.year) === latestYear);
    socialBimesters.value = [...filtered].sort(
      (a, b) => Number(a.number) - Number(b.number),
    );
    if (socialBimesters.value.length && !socialForm.value.bimester_id) {
      socialForm.value.bimester_id = String(socialBimesters.value[0].id);
    }
  } catch (e) {
    console.error(e);
    socialBimesters.value = [];
  }
}

onMounted(async () => {
  await Promise.all([
    (async () => {
      try {
        const res = await GradeSectionService.getGradeSections();
        gradeSections.value = res.data.data || [];
      } catch (e) {
        console.error(e);
        Swal.fire({
          icon: 'error',
          title: 'No se cargaron aulas',
          text: 'No se pudo obtener la lista de grados y secciones.',
        });
      }
    })(),
    loadSocialBimesters(),
  ]);
});

const submitToCreate = async () => {
  const d = alumnoData.value;
  if (!String(d.dni || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese el DNI.' });
    return;
  }
  if (!String(d.student_code || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese el código de estudiante.' });
    return;
  }
  if (!String(d.name || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese los nombres.' });
    return;
  }
  if (!String(d.surname_father || '').trim() || !String(d.surname_mother || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese apellido paterno y materno.' });
    return;
  }
  if (!d.birth_date) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese la fecha de nacimiento.' });
    return;
  }
  if (d.sex !== 'M' && d.sex !== 'F') {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Seleccione el sexo.' });
    return;
  }
  if (!String(d.password || '').trim()) {
    Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Ingrese una contraseña.' });
    return;
  }
  if (!selectedGrade.value || !selectedSection.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Seleccione grado y sección.',
    });
    return;
  }
  const gradeSectionId = resolveGradeSectionId();
  if (gradeSectionId == null) {
    Swal.fire({
      icon: 'error',
      title: 'Aula no disponible',
      text: 'La combinación grado/sección no existe en el sistema. Compruebe que en administración existan todas las aulas de 1 al 5 y secciones A a D.',
    });
    return;
  }
  if (!generatedEmailLocal.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo no generado',
      text: 'Complete nombres y apellidos para generar el correo institucional.',
    });
    return;
  }
  if (hasPartialSocial.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Información social incompleta',
      text: 'Complete trabaja y situación familiar, o déjelos ambos vacíos.',
    });
    return;
  }
  if (hasCompleteSocial.value && !socialBimesters.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Sin bimestres',
      text: 'No hay bimestres configurados. Deje vacíos los datos sociales o configure el periodo académico.',
    });
    return;
  }
  try {
    const payload = {
      ...alumnoData.value,
      grade_section_id: gradeSectionId,
      email: generatedEmailLocal.value,
    };
    if (hasCompleteSocial.value) {
      payload.social_profile = {
        bimester_id: Number(socialForm.value.bimester_id),
        works: socialForm.value.works === 'true',
        family_situation: socialForm.value.family_situation,
        apply_to_all: Boolean(socialForm.value.apply_to_all),
      };
    }
    await StudentService.createItem(payload);
    await Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Alumno registrado con éxito.',
    });
    router.push('/students');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message,
      });
    } else {
      console.log('error:' + error);
    }
  }
};
</script>

<style scoped>
.student-new {
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
}

.profile-hero__main {
  min-width: 0;
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

.student-new__identity-grid,
.student-new__personal-grid {
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

.student-new__block-title {
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

.student-new__email-group {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.student-new__email-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
  min-width: 0;
  flex: 1 1 auto;
}

.student-new__email-group .form-control[readonly] {
  background-color: var(--cui-tertiary-bg, var(--rp-border));
}

.student-new__email-suffix {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background-color: var(--rp-surface-sunken);
  border: 1px solid var(--cui-input-border-color, var(--rp-border));
  border-left: none;
  border-radius: 0 0.25rem 0.25rem 0;
  font-weight: var(--rp-weight-semibold);
  white-space: nowrap;
  color: var(--rp-text-muted);
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

@media (min-width: 768px) {
  .profile-hero__intro,
  .profile-panel__body {
    padding: var(--rp-space-5);
  }

  .profile-section-bar {
    padding: var(--rp-space-3) var(--rp-space-5);
  }

  .profile-hero__title {
    font-size: var(--rp-text-xl);
  }

  .student-new__identity-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  /* Grado 2 + Sección 2 + Fecha 4 + Sexo 3 + Dirección 5 = 16 */
  .student-new__personal-grid {
    grid-template-columns: repeat(16, minmax(0, 1fr));
  }

  .student-new__col-grado {
    grid-column: span 2;
  }

  .student-new__col-section {
    grid-column: span 2;
  }

  .student-new__col-fecha {
    grid-column: span 4;
  }

  .student-new__col-sexo {
    grid-column: span 3;
  }

  .student-new__col-dir {
    grid-column: span 5;
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

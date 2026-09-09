<template>
  <div class="module-page profile-page">
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando perfil...
    </div>

    <div v-else-if="loadError" class="module-alert module-alert--error" role="alert">
      {{ loadError }}
    </div>

    <template v-else-if="profile">
      <!-- Cabecera -->
      <section class="profile-hero mb-4">
        <div class="profile-hero__intro">
          <h1 class="profile-hero__title">
            <i class="fas fa-user-graduate" aria-hidden="true"></i>
            Mi perfil
          </h1>
          <p class="profile-hero__subtitle">
            Consulte su información académica y actualice los datos del apoderado o su contraseña.
          </p>
        </div>
      </section>

      <!-- Identidad del estudiante (solo lectura) + QR -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Datos del estudiante
        </div>
        <div class="profile-panel__body">
          <div class="profile-identity">
            <div class="profile-identity__avatar" aria-hidden="true">
              {{ initials }}
            </div>
            <div class="profile-identity__text">
              <h2 class="profile-identity__name">{{ fullName }}</h2>
              <p class="profile-identity__email">{{ profile.email || 'Sin correo registrado' }}</p>
              <span class="profile-identity__role">Estudiante</span>
            </div>
            <CButton
              color="primary"
              class="profile-qr-btn"
              :disabled="loadingQr"
              @click="obtenerQrCode"
            >
              <CSpinner v-if="loadingQr" size="sm" class="me-2" />
              <i v-else class="fas fa-qrcode me-2" aria-hidden="true"></i>
              {{ loadingQr ? 'Cargando...' : 'Ver QR' }}
            </CButton>
          </div>

          <div class="profile-meta">
            <div class="info-box">
              <label>DNI</label>
              <p>{{ profile.dni || '—' }}</p>
            </div>
            <div class="info-box">
              <label>Fecha de nacimiento</label>
              <p>{{ formatDate(profile.birth_date) }}</p>
            </div>
            <div class="info-box">
              <label>Edad</label>
              <p>{{ profile.age != null ? profile.age : '—' }} años</p>
            </div>
            <div class="info-box">
              <label>Grado</label>
              <p>{{ profile.grade || '—' }}° {{ profile.section || '—' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Apoderado editable -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Datos del apoderado y contacto
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">
            Estos datos se usan en trámites. Manténgalos actualizados.
          </p>

          <div class="profile-form-grid profile-form-grid--apoderado">
            <div class="profile-field profile-field--dni">
              <CFormLabel for="rep-dni">Dni</CFormLabel>
              <CFormInput
                id="rep-dni"
                v-model="form.representative_dni"
                type="text"
                inputmode="numeric"
                maxlength="8"
                placeholder="12345678"
                :invalid="!!errors.representative_dni"
                aria-describedby="rep-dni-error"
                @input="clearError('representative_dni')"
              />
              <div
                v-if="errors.representative_dni"
                id="rep-dni-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.representative_dni }}
              </div>
            </div>

            <div class="profile-field profile-field--name">
              <CFormLabel for="rep-name">Nombre completo</CFormLabel>
              <CFormInput
                id="rep-name"
                v-model="form.representative_name"
                type="text"
                maxlength="120"
                placeholder="Nombre del apoderado"
                :invalid="!!errors.representative_name"
                aria-describedby="rep-name-error"
                @input="clearError('representative_name')"
              />
              <div
                v-if="errors.representative_name"
                id="rep-name-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.representative_name }}
              </div>
            </div>

            <div class="profile-field profile-field--rel">
              <CFormLabel for="rep-rel">Parentesco</CFormLabel>
              <CFormSelect
                id="rep-rel"
                v-model="form.representative_relationship"
                :invalid="!!errors.representative_relationship"
                aria-describedby="rep-rel-error"
                @change="clearError('representative_relationship')"
              >
                <option value="">Seleccione</option>
                <option
                  v-for="option in relationshipOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </CFormSelect>
              <div
                v-if="errors.representative_relationship"
                id="rep-rel-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.representative_relationship }}
              </div>
            </div>

            <div class="profile-field profile-field--phone">
              <CFormLabel for="rep-phone">Teléfono</CFormLabel>
              <CFormInput
                id="rep-phone"
                v-model="form.representative_phone"
                type="tel"
                inputmode="numeric"
                maxlength="9"
                placeholder="999999999"
                :invalid="!!errors.representative_phone"
                aria-describedby="rep-phone-error"
                @input="clearError('representative_phone')"
              />
              <div
                v-if="errors.representative_phone"
                id="rep-phone-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.representative_phone }}
              </div>
            </div>

            <div class="profile-field profile-field--address">
              <CFormLabel for="rep-address">Dirección del apoderado</CFormLabel>
              <CFormInput
                id="rep-address"
                v-model="form.address"
                type="text"
                maxlength="180"
                placeholder="Requerida para registrar trámites"
                autocomplete="street-address"
                :invalid="!!errors.address"
                aria-describedby="rep-address-error"
                @input="clearError('address')"
              />
              <div
                v-if="errors.address"
                id="rep-address-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.address }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seguridad -->
      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Seguridad de la cuenta
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">
            Deje los campos de contraseña vacíos si solo desea actualizar datos del apoderado.
          </p>

          <div class="profile-security-fields">
            <div class="profile-field">
              <CFormLabel for="profile-current-password">Contraseña actual</CFormLabel>
              <CFormInput
                id="profile-current-password"
                v-model="form.current_password"
                type="password"
                autocomplete="current-password"
                placeholder="Requerida solo al cambiar"
                :invalid="!!errors.current_password"
                aria-describedby="profile-current-password-error"
                @input="clearError('current_password')"
              />
              <div
                v-if="errors.current_password"
                id="profile-current-password-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.current_password }}
              </div>
            </div>

            <div class="profile-field">
              <CFormLabel for="profile-new-password">Nueva contraseña</CFormLabel>
              <CFormInput
                id="profile-new-password"
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                :invalid="!!errors.password"
                aria-describedby="profile-new-password-error"
                @input="clearError('password')"
              />
              <div
                v-if="errors.password"
                id="profile-new-password-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.password }}
              </div>
            </div>

            <div class="profile-field">
              <CFormLabel for="profile-confirm-password">Confirmar contraseña</CFormLabel>
              <CFormInput
                id="profile-confirm-password"
                v-model="form.password_confirmation"
                type="password"
                autocomplete="new-password"
                placeholder="Repita la nueva contraseña"
                :invalid="!!errors.password_confirmation"
                aria-describedby="profile-confirm-password-error"
                @input="clearError('password_confirmation')"
              />
              <div
                v-if="errors.password_confirmation"
                id="profile-confirm-password-error"
                class="profile-field-error"
                role="alert"
              >
                {{ errors.password_confirmation }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="profile-actions">
        <CButton color="secondary" variant="outline" class="profile-actions__back" @click="$router.back()">
          Regresar
        </CButton>
        <CButton color="primary" class="profile-actions__save" :disabled="saving" @click="submitToEdit">
          <CSpinner v-if="saving" size="sm" class="me-2" />
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </CButton>
      </div>
    </template>

    <CModal :visible="showQRModal" alignment="center" @close="closeQrModal">
      <CModalHeader>
        <CModalTitle>QR del estudiante</CModalTitle>
      </CModalHeader>
      <CModalBody class="text-center">
        <img v-if="qrImage" :src="qrImage" alt="Código QR del estudiante" class="profile-qr-image" />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" @click="closeQrModal">Cerrar</CButton>
        <CButton color="primary" :disabled="!qrImage" @click="downloadQR">Descargar QR</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import StudentService from '@/services/StudentService';
import { computed, onMounted, reactive, ref } from 'vue';
import { toastError, toastSuccess } from '@/utils/alerts';
import { formatDate } from '@/utils/time';
import { BRAND_COLOR } from '@/utils/brand';
import Swal from 'sweetalert2';

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

const loading = ref(true);
const saving = ref(false);
const loadingQr = ref(false);
const loadError = ref('');
const profile = ref(null);
const showQRModal = ref(false);
const qrImage = ref(null);

const form = reactive({
  representative_dni: '',
  representative_name: '',
  representative_phone: '',
  representative_relationship: '',
  address: '',
  current_password: '',
  password: '',
  password_confirmation: '',
});

const errors = reactive({
  representative_dni: '',
  representative_name: '',
  representative_phone: '',
  representative_relationship: '',
  address: '',
  current_password: '',
  password: '',
  password_confirmation: '',
});

const fullName = computed(() => {
  if (!profile.value) return '';
  return [profile.value.name, profile.value.surname_father, profile.value.surname_mother]
    .filter(Boolean)
    .join(' ');
});

const initials = computed(() => {
  if (!profile.value) return 'ES';
  const first = (profile.value.name || '').trim().charAt(0);
  const last = (profile.value.surname_father || '').trim().charAt(0);
  return `${first}${last}`.toUpperCase() || 'ES';
});

const sexLabel = computed(() => {
  if (profile.value?.sex === 'M') return 'Masculino';
  if (profile.value?.sex === 'F') return 'Femenino';
  return '—';
});

/** Incluye el valor guardado si no está en el catálogo (datos legacy). */
const relationshipOptions = computed(() => {
  const current = String(form.representative_relationship || '').trim();
  if (current && !RELATIONSHIP_OPTIONS.includes(current)) {
    return [current, ...RELATIONSHIP_OPTIONS];
  }
  return RELATIONSHIP_OPTIONS;
});

const clearError = (field) => {
  if (errors[field]) {
    errors[field] = '';
  }
};

const resetErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
};

const mapProfile = (row) => {
  const emailRaw = row?.user?.email ?? '';
  const gradeSection = row?.grade_section || row?.gradeSection || {};
  return {
    id: row.id,
    name: row.name || '',
    surname_father: row.surname_father || '',
    surname_mother: row.surname_mother || '',
    dni: row.dni || '',
    birth_date: row.birth_date || '',
    age: row.age ?? null,
    sex: row.sex || '',
    grade: gradeSection.grade || '',
    section: gradeSection.section || '',
    email: typeof emailRaw === 'string' ? emailRaw : '',
    representative_dni: row.representative_dni || '',
    representative_name: row.representative_name || '',
    representative_phone: row.representative_phone || '',
    representative_relationship: row.representative_relationship || '',
    address: row.address || '',
  };
};

const applyFormFromProfile = (mapped) => {
  form.representative_dni = mapped.representative_dni;
  form.representative_name = mapped.representative_name;
  form.representative_phone = mapped.representative_phone;
  form.representative_relationship = mapped.representative_relationship;
  form.address = mapped.address;
  form.current_password = '';
  form.password = '';
  form.password_confirmation = '';
};

const getDataStudent = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await StudentService.getItem();
    const mapped = mapProfile(response.data.data);
    profile.value = mapped;
    applyFormFromProfile(mapped);
  } catch (error) {
    loadError.value =
      error?.response?.data?.message || 'No se pudo cargar el perfil del estudiante.';
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  resetErrors();
  let valid = true;

  const dni = String(form.representative_dni || '').trim();
  if (dni && !/^\d{8}$/.test(dni)) {
    errors.representative_dni = 'Ingrese un DNI válido de 8 dígitos.';
    valid = false;
  }

  const phone = String(form.representative_phone || '').trim();
  if (phone && !/^\d{9}$/.test(phone)) {
    errors.representative_phone = 'Ingrese un teléfono válido de 9 dígitos.';
    valid = false;
  }

  const address = String(form.address || '').trim();
  if (address && address.length < 5) {
    errors.address = 'La dirección es demasiado corta.';
    valid = false;
  }

  const name = String(form.representative_name || '').trim();
  if (name && name.length < 3) {
    errors.representative_name = 'Ingrese el nombre completo del apoderado.';
    valid = false;
  }

  const wantsPasswordChange = Boolean(
    form.password || form.password_confirmation || form.current_password,
  );
  if (wantsPasswordChange) {
    if (!form.current_password) {
      errors.current_password = 'Ingrese su contraseña actual.';
      valid = false;
    }
    if (!form.password) {
      errors.password = 'Ingrese la nueva contraseña.';
      valid = false;
    } else if (form.password.length < 8) {
      errors.password = 'La nueva contraseña debe tener al menos 8 caracteres.';
      valid = false;
    }
    if (!form.password_confirmation) {
      errors.password_confirmation = 'Confirme la nueva contraseña.';
      valid = false;
    } else if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden.';
      valid = false;
    }
  }

  return valid;
};

const submitToEdit = async () => {
  if (!profile.value || !validateForm()) {
    return;
  }

  saving.value = true;
  try {
    const data = {
      address: String(form.address || '').trim(),
      representative_dni: String(form.representative_dni || '').trim(),
      representative_name: String(form.representative_name || '').trim(),
      representative_phone: String(form.representative_phone || '').trim(),
      representative_relationship: String(form.representative_relationship || '').trim(),
    };

    if (form.password) {
      data.password = form.password;
      data.current_password = form.current_password;
    }

    await StudentService.updateItem(data);
    toastSuccess('Perfil actualizado correctamente');

    profile.value = {
      ...profile.value,
      address: data.address,
      representative_dni: data.representative_dni,
      representative_name: data.representative_name,
      representative_phone: data.representative_phone,
      representative_relationship: data.representative_relationship,
    };
    form.current_password = '';
    form.password = '';
    form.password_confirmation = '';
  } catch (error) {
    const message = error?.response?.data?.message || 'No se pudo actualizar el perfil';
    toastError(message);
  } finally {
    saving.value = false;
  }
};

const closeQrModal = () => {
  showQRModal.value = false;
};

const downloadQR = async () => {
  if (!qrImage.value || !profile.value) return;
  try {
    const response = await fetch(qrImage.value);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${profile.value.dni || profile.value.id}.png`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch {
    toastError('No se pudo descargar el QR');
  }
};

const obtenerQrCode = async () => {
  if (!profile.value?.id) return;
  loadingQr.value = true;
  try {
    const response = await StudentService.getPathImageQrCode(profile.value.id);
    qrImage.value = `${URL_DJANGO_MEDIA}/${response.data.qr_code}`;
    showQRModal.value = true;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al obtener QR',
      text: error?.response?.data?.message || 'No se pudo obtener el código QR',
      confirmButtonColor: BRAND_COLOR,
    });
  } finally {
    loadingQr.value = false;
  }
};

onMounted(getDataStudent);
</script>

<style scoped>
.profile-page {
  width: 100%;
  max-width: 100%;
  padding-inline: var(--rp-space-3);
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

.profile-hero__title i {
  font-size: 1.1em;
  flex-shrink: 0;
}

.profile-hero__subtitle {
  margin: var(--rp-space-2) 0 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
  max-width: 42rem;
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

.profile-identity {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--rp-space-3);
  margin-bottom: var(--rp-space-4);
}

.profile-identity__avatar {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--rp-radius-lg);
  background: linear-gradient(145deg, var(--rp-brand-400), var(--rp-brand-600));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--rp-weight-bold);
  font-size: var(--rp-text-md);
  flex-shrink: 0;
  box-shadow: 0 6px 14px rgba(var(--rp-brand-rgb), 0.28);
}

.profile-identity__text {
  min-width: 0;
  flex: 1 1 12rem;
}

.profile-identity__name {
  margin: 0;
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-tight);
  overflow-wrap: anywhere;
}

.profile-identity__email {
  margin: var(--rp-space-1) 0 0;
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  overflow-wrap: anywhere;
}

.profile-identity__role {
  display: inline-block;
  margin-top: var(--rp-space-2);
  padding: var(--rp-space-1) var(--rp-space-3);
  border-radius: var(--rp-radius-pill);
  background: var(--rp-brand-500);
  color: #fff;
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: var(--rp-tracking-wide);
  text-transform: uppercase;
}

.profile-qr-btn {
  min-height: 44px;
  width: 100%;
}

.profile-meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-3);
}

.info-box {
  padding: var(--rp-space-3) var(--rp-space-4);
  background: linear-gradient(180deg, var(--rp-brand-50) 0%, var(--rp-surface) 100%);
  border: 1px solid var(--rp-border-brand);
  border-left: 3px solid var(--rp-brand-400);
  border-radius: var(--rp-radius-md);
  min-width: 0;
}

.info-box label {
  display: block;
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--rp-tracking-wide);
  color: var(--rp-brand-600);
  margin-bottom: var(--rp-space-1);
}

.info-box p {
  margin: 0;
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  overflow-wrap: anywhere;
}

.profile-section-hint {
  margin: 0 0 var(--rp-space-4);
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-normal);
}

.profile-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-3);
}

.profile-field {
  min-width: 0;
}

.profile-security-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rp-space-3);
}

.profile-field-error {
  margin-top: var(--rp-space-1);
  font-size: var(--rp-text-xs);
  color: var(--rp-danger-500);
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

.profile-qr-image {
  max-width: min(100%, 16rem);
  height: auto;
}

/* Tablet */
@media (min-width: 768px) {
  .profile-page {
    padding-inline: var(--rp-space-4);
  }

  .profile-hero__intro,
  .profile-panel__body {
    padding: var(--rp-space-5);
  }

  .profile-section-bar {
    padding: var(--rp-space-3) var(--rp-space-5);
  }

  .profile-hero__title,
  .profile-identity__name {
    font-size: var(--rp-text-xl);
  }

  .profile-identity {
    align-items: center;
    gap: var(--rp-space-4);
    margin-bottom: var(--rp-space-5);
  }

  .profile-identity__avatar {
    width: 3.75rem;
    height: 3.75rem;
    font-size: var(--rp-text-lg);
  }

  .profile-identity__email {
    font-size: var(--rp-text-base);
  }

  .profile-qr-btn {
    width: auto;
    margin-left: auto;
  }

  .profile-meta {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .profile-form-grid--apoderado {
    grid-template-columns: 7.5rem minmax(0, 1fr) 8.5rem;
  }

  .profile-field--phone {
    grid-column: 1;
  }

  .profile-field--address {
    grid-column: 2 / -1;
  }

  .profile-security-fields {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--rp-space-4);
  }

  .profile-actions {
    gap: var(--rp-space-4);
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

/* PC */
@media (min-width: 992px) {
  .profile-page {
    padding-inline: 0;
  }

  .profile-meta {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .profile-form-grid--apoderado {
    grid-template-columns: 8rem minmax(0, 1.5fr) 10rem;
  }

  .profile-field--phone {
    grid-column: 1;
  }

  .profile-field--address {
    grid-column: 2 / -1;
  }
}
</style>

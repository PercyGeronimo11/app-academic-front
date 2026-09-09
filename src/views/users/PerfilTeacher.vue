<template>
  <div class="module-page profile-page">
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando perfil...
    </div>

    <div v-else-if="loadError" class="module-alert module-alert--error" role="alert">
      {{ loadError }}
    </div>

    <template v-else-if="profile">
      <section class="profile-hero mb-4">
        <div class="profile-hero__intro">
          <h1 class="profile-hero__title">
            <i class="fas fa-chalkboard-teacher" aria-hidden="true"></i>
            Mi perfil
          </h1>
          <p class="profile-hero__subtitle">
            Consulte sus datos institucionales y actualice su información de contacto o contraseña.
          </p>
        </div>
      </section>

      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Datos del docente y contacto
        </div>
        <div class="profile-panel__body">
          <div class="profile-identity">
            <div class="profile-identity__avatar" aria-hidden="true">
              {{ initials }}
            </div>
            <div class="profile-identity__text">
              <h2 class="profile-identity__name">{{ fullName }}</h2>
              <p class="profile-identity__email">{{ profile.email || 'Sin correo registrado' }}</p>
              <span class="profile-identity__role">Docente</span>
            </div>
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
              <p>{{ profile.age != null ? `${profile.age} años` : '—' }}</p>
            </div>
            <div class="info-box">
              <label>Título académico</label>
              <p>{{ profile.academic_degree || '—' }}</p>
            </div>
          </div>

          <div class="profile-contact">
            <div class="profile-form-grid profile-form-grid--contact">
              <div class="profile-field">
                <CFormLabel for="profile-phone">Teléfono</CFormLabel>
                <CFormInput
                  id="profile-phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="numeric"
                  maxlength="9"
                  placeholder="987654321"
                  autocomplete="tel"
                  :invalid="!!errors.phone"
                  aria-describedby="profile-phone-error"
                  @input="clearError('phone')"
                />
                <div
                  v-if="errors.phone"
                  id="profile-phone-error"
                  class="profile-field-error"
                  role="alert"
                >
                  {{ errors.phone }}
                </div>
              </div>

              <div class="profile-field profile-field--address">
                <CFormLabel for="profile-address">Dirección</CFormLabel>
                <CFormInput
                  id="profile-address"
                  v-model="form.address"
                  type="text"
                  maxlength="180"
                  placeholder="Calle, número, distrito"
                  autocomplete="street-address"
                  :invalid="!!errors.address"
                  aria-describedby="profile-address-error"
                  @input="clearError('address')"
                />
                <div
                  v-if="errors.address"
                  id="profile-address-error"
                  class="profile-field-error"
                  role="alert"
                >
                  {{ errors.address }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="profile-panel mb-4">
        <div class="profile-section-bar" role="presentation">
          Seguridad de la cuenta
        </div>
        <div class="profile-panel__body">
          <p class="profile-section-hint">
            Deje los campos de contraseña vacíos si solo desea actualizar el contacto.
            Para cambiarla, debe confirmar su contraseña actual.
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
  </div>
</template>

<script setup>
import TeacherService from '@/services/TeacherService';
import { computed, onMounted, reactive, ref } from 'vue';
import { toastError, toastSuccess } from '@/utils/alerts';
import { formatDate } from '@/utils/time';

const loading = ref(true);
const saving = ref(false);
const loadError = ref('');
const profile = ref(null);

const form = reactive({
  phone: '',
  address: '',
  current_password: '',
  password: '',
  password_confirmation: '',
});

const errors = reactive({
  phone: '',
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
  if (!profile.value) return 'DO';
  const first = (profile.value.name || '').trim().charAt(0);
  const last = (profile.value.surname_father || '').trim().charAt(0);
  return `${first}${last}`.toUpperCase() || 'DO';
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
  return {
    id: row.id,
    name: row.name || '',
    surname_father: row.surname_father || '',
    surname_mother: row.surname_mother || '',
    dni: row.dni || '',
    birth_date: row.birth_date || '',
    age: row.age ?? null,
    academic_degree: row.academic_degree || '',
    phone: row.phone || '',
    address: row.address || '',
    email: typeof emailRaw === 'string' ? emailRaw : '',
  };
};

const loadProfile = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await TeacherService.getItem();
    const mapped = mapProfile(response.data.data);
    profile.value = mapped;
    form.phone = mapped.phone;
    form.address = mapped.address;
    form.current_password = '';
    form.password = '';
    form.password_confirmation = '';
  } catch (error) {
    loadError.value =
      error?.response?.data?.message || 'No se pudo cargar el perfil del docente.';
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  resetErrors();
  let valid = true;

  const phone = String(form.phone || '').trim();
  if (phone && !/^\d{9}$/.test(phone)) {
    errors.phone = 'Ingrese un teléfono válido de 9 dígitos.';
    valid = false;
  }

  const address = String(form.address || '').trim();
  if (address && address.length < 5) {
    errors.address = 'La dirección es demasiado corta.';
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
      phone: String(form.phone || '').trim(),
      address: String(form.address || '').trim(),
    };

    if (form.password) {
      data.password = form.password;
      data.current_password = form.current_password;
    }

    await TeacherService.updateItem(data);
    toastSuccess('Datos actualizados correctamente');

    profile.value.phone = data.phone;
    profile.value.address = data.address;
    form.current_password = '';
    form.password = '';
    form.password_confirmation = '';
  } catch (error) {
    const message = error?.response?.data?.message || 'Error al actualizar el perfil';
    toastError(message);
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
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
  flex: 1;
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

.profile-contact {
  margin-top: var(--rp-space-4);
  padding-top: var(--rp-space-4);
  border-top: 1px solid var(--rp-border-subtle);
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

  .profile-meta {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .profile-contact {
    margin-top: var(--rp-space-5);
    padding-top: var(--rp-space-5);
  }

  .profile-form-grid--contact {
    grid-template-columns: 10rem minmax(0, 1fr);
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

  .profile-form-grid--contact {
    grid-template-columns: 11rem minmax(0, 1fr);
  }
}
</style>

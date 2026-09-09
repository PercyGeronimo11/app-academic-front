<template>
  <CContainer fluid class="px-2 px-md-3 administrative-crud">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="administrative-crud__intro mb-3">
              <div class="administrative-crud__intro-text">
                <h4 class="administrative-crud__title mb-1">
                  <i class="fas fa-user-tie" aria-hidden="true"></i>
                  Lista de administrativos
                </h4>
                <p class="administrative-crud__subtitle mb-0">
                  Alta, edición y búsqueda de personal administrativo.
                </p>
              </div>
              <CButton
                color="primary"
                class="administrative-crud__new d-none d-md-inline-flex"
                @click="openCreateModal"
              >
                <i class="fas fa-plus me-2" aria-hidden="true"></i>
                Nuevo
              </CButton>
            </div>

            <CRow class="g-2 align-items-stretch align-items-md-end">
              <CCol xs="12" md>
                <CInputGroup>
                  <CFormInput
                    v-model="searchData"
                    placeholder="Buscar por apellido, nombre o DNI"
                    aria-label="Buscar por apellido, nombre o DNI"
                    @keyup.enter="listAdministrativeService(searchData)"
                  />
                  <CButton
                    type="button"
                    color="primary"
                    @click="listAdministrativeService(searchData)"
                  >
                    Buscar
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol xs="12" class="d-md-none">
                <CButton color="primary" class="w-100" @click="openCreateModal">
                  <i class="fas fa-plus me-2" aria-hidden="true"></i>
                  Nuevo
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="p-0">
            <div class="list-with-pagination-wrap">
              <ElegantCrudList
                :columns="listColumns"
                :data="administratives"
                empty-message="No hay administrativos para mostrar."
                empty-hint="Prueba otra búsqueda o usa «Nuevo» para registrar un administrativo."
                empty-icon="👔"
              >
                <template #full_name="{ item }">
                  <div class="administrative-name">
                    <span class="administrative-name__given">{{ item.names || '—' }}</span>
                    <span class="administrative-name__surnames">{{ fullSurnames(item) }}</span>
                  </div>
                </template>

                <template #role="{ item }">
                  <span class="administrative-role">{{ item?.rol?.name || item?.user?.role?.name || '—' }}</span>
                </template>

                <template #actions="{ item }">
                  <div class="administrative-actions">
                    <CButton
                      color="warning"
                      size="sm"
                      class="text-white administrative-actions__btn"
                      title="Editar"
                      @click.stop="openEditModal(item.id)"
                    >
                      <CIcon :content="cilPencil" />
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      class="text-white administrative-actions__btn"
                      title="Eliminar"
                      @click.stop="deleteItem(item)"
                    >
                      <CIcon :content="cilTrash" />
                    </CButton>
                  </div>
                </template>
              </ElegantCrudList>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

  <CModal
    :visible="isModalOpen"
    scrollable
    size="lg"
    alignment="center"
    aria-labelledby="administrative-modal-title"
    @close="closeModal"
  >
    <CModalHeader class="bg-primary text-white border-0">
      <CModalTitle id="administrative-modal-title">
        {{ isEditMode ? 'Editar Administrativo' : 'Crear Administrativo' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="isEditMode ? submitToEdit() : submitToCreate()">
        <CContainer>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="4">
              <CFormInput
                v-model="administrativeData.names"
                label="Nombres *"
                placeholder="Nombres"
                required
              />
            </CCol>
            <CCol xs="12" md="4">
              <CFormInput
                v-model="administrativeData.surname_father"
                label="Apellido paterno *"
                placeholder="Apellido paterno"
                required
              />
            </CCol>
            <CCol xs="12" md="4">
              <CFormInput
                v-model="administrativeData.surname_mother"
                label="Apellido materno *"
                placeholder="Apellido materno"
                required
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="4">
              <CFormSelect v-model="administrativeData.role_id" label="Rol *" required>
                <option value="">Seleccione un rol</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </CFormSelect>
            </CCol>
            <CCol xs="12" md="4">
              <CFormInput
                v-model="administrativeData.dni"
                label="DNI"
                placeholder="Documento de identidad"
                maxlength="8"
                inputmode="numeric"
                @input="limitDniLength"
              />
            </CCol>
            <CCol xs="12" md="4">
              <CFormInput
                v-model="administrativeData.birth_date"
                label="Fecha de nacimiento *"
                type="date"
                required
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormInput
                v-model="administrativeData.address"
                label="Dirección"
                placeholder="Dirección"
              />
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput
                v-model="administrativeData.phone_number"
                label="N° de teléfono"
                placeholder="987654321"
                maxlength="9"
                inputmode="numeric"
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormLabel for="administrative-email">Correo institucional (generado)</CFormLabel>
              <div class="administrative-email-group">
                <input
                  id="administrative-email"
                  type="text"
                  class="form-control"
                  :value="displayedEmailLocal"
                  readonly
                  aria-readonly="true"
                />
                <span class="administrative-email-suffix">@ierp.edu.pe</span>
              </div>
              <small v-if="!isEditMode" class="text-body-secondary d-block mt-1">
                Primera letra del nombre, apellido paterno completo y primera letra del apellido materno.
              </small>
              <small v-else class="text-body-secondary d-block mt-1">
                El correo no se puede modificar.
              </small>
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput
                v-model="administrativeData.password"
                :label="isEditMode ? 'Contraseña' : 'Contraseña *'"
                type="password"
                :placeholder="isEditMode ? 'Dejar vacío para no cambiar' : 'Contraseña de acceso'"
                :required="!isEditMode"
                autocomplete="new-password"
              />
            </CCol>
          </CRow>
        </CContainer>
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="closeModal">Cancelar</CButton>
      <CButton color="primary" @click="isEditMode ? submitToEdit() : submitToCreate()">
        {{ isEditMode ? 'Actualizar' : 'Registrar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import AdministrativeService from '@/services/AdministrativeService';
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { cilPencil, cilTrash } from '@coreui/icons';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import { BRAND_COLOR, DANGER_COLOR } from '@/utils/brand';

const listColumns = computed(() => [
  { key: 'id', label: 'N°' },
  { key: 'full_name', label: 'Nombre y apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'phone_number', label: 'Teléfono', hideOnMobile: true },
  { key: 'role', label: 'Rol' },
  { key: 'actions', label: 'Opciones', center: true },
]);

const administratives = ref([]);
const roles = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const idItemSelected = ref(0);
const searchData = ref('');
const administrativeData = ref(emptyAdministrative());

function emptyAdministrative() {
  return {
    names: '',
    surname_father: '',
    surname_mother: '',
    birth_date: '',
    role_id: '',
    dni: '',
    phone_number: '',
    address: '',
    email: '',
    password: '',
  };
}

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
  const fn = firstLetterName(administrativeData.value.names);
  const father = normalizeLetters(administrativeData.value.surname_father || '');
  const motherFirst = normalizeLetters(
    String(administrativeData.value.surname_mother || '').charAt(0) || '',
  );
  return `${fn}${father}${motherFirst}`.slice(0, 64);
});

/** En alta se genera; en edición se muestra el correo ya guardado. */
const displayedEmailLocal = computed(() => {
  if (isEditMode.value) {
    return String(administrativeData.value.email || '').trim();
  }
  return generatedEmailLocal.value;
});

watch(generatedEmailLocal, (v) => {
  if (!isEditMode.value) {
    administrativeData.value.email = v;
  }
});

const fullSurnames = (item) => {
  const value = [item?.surname_father, item?.surname_mother].filter(Boolean).join(' ');
  return value || '—';
};

onMounted(async () => {
  try {
    await Promise.all([listAdministrativeService(), listRoles()]);
  } catch (error) {
    console.error(error);
  }
});

const listRoles = async () => {
  const response = await AdministrativeService.getRoles();
  roles.value = response.data.data;
};

const listAdministrativeService = async (data) => {
  const response = await AdministrativeService.getItems(data);
  administratives.value = response.data.data;
};

const openCreateModal = () => {
  clearDataModal();
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openEditModal = async (id) => {
  const response = await AdministrativeService.getItem(id);
  idItemSelected.value = response.data.data.id;
  administrativeData.value = { ...emptyAdministrative(), ...response.data.data };
  administrativeData.value.email = response.data.data.user.email.replace('@ierp.edu.pe', '');
  administrativeData.value.role_id = response.data.data.user.role_id ?? '';
  administrativeData.value.password = '';
  isEditMode.value = true;
  isModalOpen.value = true;
};

const clearDataModal = () => {
  administrativeData.value = emptyAdministrative();
};

const closeModal = () => {
  isModalOpen.value = false;
  clearDataModal();
};

const submitToCreate = async () => {
  const falta = missingFieldsMessage();
  if (falta) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: falta,
      confirmButtonColor: BRAND_COLOR,
    });
    return;
  }
  if (!generatedEmailLocal.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Correo no generado',
      text: 'Complete nombres y apellidos para generar el correo institucional.',
      confirmButtonColor: BRAND_COLOR,
    });
    return;
  }

  try {
    const payload = {
      ...administrativeData.value,
      email: generatedEmailLocal.value,
    };
    await AdministrativeService.createItem(payload);
    listAdministrativeService(searchData.value);
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Administrativo registrado con éxito.',
      confirmButtonColor: BRAND_COLOR,
    });
  } catch (error) {
    if (error.response?.data?.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message,
        confirmButtonColor: BRAND_COLOR,
      });
    } else {
      console.log('error:' + error);
    }
  }
};

const submitToEdit = async () => {
  const falta = missingFieldsMessage();
  if (falta) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: falta,
      confirmButtonColor: BRAND_COLOR,
    });
    return;
  }

  administrativeData.value.id = idItemSelected.value;
  const data = { ...administrativeData.value };
  if (!data.password) {
    delete data.password;
  }
  // El correo institucional no se edita.
  delete data.email;

  try {
    await AdministrativeService.updateItem(data);
    listAdministrativeService(searchData.value);
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: 'Administrativo actualizado con éxito.',
      confirmButtonColor: BRAND_COLOR,
    });
  } catch (error) {
    const mensaje = error.response?.data?.message;
    if (mensaje) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: Array.isArray(mensaje) ? mensaje[0] : mensaje,
        confirmButtonColor: BRAND_COLOR,
      });
    } else {
      console.log('error:' + error);
    }
  }
};

const deleteItem = async (item) => {
  const fullName = [item?.names, item?.surname_father, item?.surname_mother]
    .filter(Boolean)
    .join(' ');
  const label = fullName || 'este administrativo';
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: DANGER_COLOR,
      title: 'Eliminar Administrativo',
      html: `¿Está seguro de eliminar a <strong>${safeLabel}</strong>?`,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: DANGER_COLOR,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: BRAND_COLOR,
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await AdministrativeService.deleteItem(item.id);
      listAdministrativeService(searchData.value);
      Swal.fire({
        icon: 'success',
        title: 'Administrativo eliminado',
        text: `${label} ha sido eliminado exitosamente.`,
        confirmButtonColor: BRAND_COLOR,
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el administrativo. Por favor, inténtalo de nuevo.',
      confirmButtonColor: BRAND_COLOR,
    });
  }
};

const limitDniLength = (event) => {
  const dni = String(event.target.value || '').replace(/\D/g, '');
  const clipped = dni.substring(0, 8);
  event.target.value = clipped;
  administrativeData.value.dni = clipped;
};

const missingFieldsMessage = () => {
  const d = administrativeData.value;
  const vacio = (valor) => !String(valor ?? '').trim();

  if (
    vacio(d.names)
    || vacio(d.surname_father)
    || vacio(d.surname_mother)
    || vacio(d.birth_date)
  ) {
    return 'Complete todos los campos obligatorios.';
  }

  if (vacio(d.role_id)) {
    return 'Seleccione el rol del administrativo.';
  }

  if (!isEditMode.value && vacio(d.password)) {
    return 'Ingrese una contraseña para el usuario.';
  }

  return null;
};

watch(searchData, (newVal) => {
  listAdministrativeService(newVal);
});
</script>

<style scoped>
.administrative-crud__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
}

.administrative-crud__title {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  margin: 0;
  font-weight: var(--rp-weight-bold);
  color: var(--rp-brand-500);
  font-size: var(--rp-text-lg);
  line-height: var(--rp-leading-tight);
}

.administrative-crud__subtitle {
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
}

.administrative-crud__new {
  flex-shrink: 0;
  min-height: 44px;
  align-items: center;
}

.administrative-name {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  max-width: 14rem;
  text-align: left;
}

.administrative-name__given {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.administrative-name__surnames {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.administrative-role {
  display: block;
  text-align: left;
  font-size: var(--rp-text-sm);
}

.administrative-actions {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: var(--rp-space-1);
}

.administrative-actions__btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
}

.administrative-email-group {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.administrative-email-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
  min-width: 0;
  flex: 1 1 auto;
}

.administrative-email-group .form-control[readonly] {
  background-color: var(--cui-tertiary-bg, var(--rp-border));
}

.administrative-email-suffix {
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

@media (min-width: 768px) {
  .administrative-crud__title {
    font-size: var(--rp-text-xl);
  }

  .administrative-name {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    max-width: none;
  }

  .administrative-name__given,
  .administrative-name__surnames {
    font-size: inherit;
    line-height: var(--rp-leading-normal);
    overflow-wrap: normal;
    white-space: nowrap;
  }

  .administrative-name__surnames {
    color: var(--rp-text-heading);
    font-weight: var(--rp-weight-semibold);
  }

  .administrative-actions {
    gap: var(--rp-space-2);
  }

  .administrative-actions__btn {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>

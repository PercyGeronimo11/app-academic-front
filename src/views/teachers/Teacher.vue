<template>
  <CContainer fluid :class="embedded ? 'px-0' : 'px-2 px-md-3'" class="teacher-crud">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div v-if="!embedded" class="teacher-crud__intro mb-3">
              <div class="teacher-crud__intro-text">
                <h4 class="teacher-crud__title mb-1">
                  <i class="fas fa-chalkboard-teacher" aria-hidden="true"></i>
                  Lista de docentes
                </h4>
                <p class="teacher-crud__subtitle mb-0">
                  Alta, edición y búsqueda de personal docente.
                </p>
              </div>
              <CButton
                v-if="!assignmentOnly"
                color="primary"
                class="teacher-crud__new d-none d-md-inline-flex"
                @click="openCreateModal"
              >
                <i class="fas fa-plus me-2" aria-hidden="true"></i>
                Nuevo
              </CButton>
            </div>

            <CRow class="g-2 align-items-stretch align-items-md-end">
              <CCol xs="12" :md="assignmentOnly ? 12 : true">
                <CInputGroup>
                  <CFormInput
                    v-model="searchData"
                    placeholder="Buscar por apellido, nombre o DNI"
                    aria-label="Buscar por apellido, nombre o DNI"
                    @keyup.enter="listTeacherService(searchData)"
                  />
                  <CButton
                    type="button"
                    color="primary"
                    @click="listTeacherService(searchData)"
                  >
                    Buscar
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol
                v-if="!assignmentOnly"
                xs="12"
                class="d-md-none"
              >
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
                :data="teachers"
                empty-message="No hay docentes para mostrar."
                :empty-hint="emptyHint"
                empty-icon="👨‍🏫"
              >
                <template #full_name="{ item }">
                  <div class="teacher-name">
                    <span class="teacher-name__given">{{ item.name || '—' }}</span>
                    <span class="teacher-name__surnames">{{ fullSurnames(item) }}</span>
                  </div>
                </template>

                <template #actions="{ item }">
                  <div class="teacher-actions">
                    <CButton
                      v-if="assignmentOnly"
                      color="warning"
                      size="sm"
                      class="text-white teacher-actions__btn"
                      title="Asignar aulas y cursos"
                      @click.stop="openClassroomsModal(item)"
                    >
                      <CIcon :content="cilPencil" />
                    </CButton>
                    <template v-else>
                      <CButton
                        color="warning"
                        size="sm"
                        class="text-white teacher-actions__btn"
                        title="Editar"
                        @click.stop="openEditModal(item.id)"
                      >
                        <CIcon :content="cilPencil" />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        class="text-white teacher-actions__btn"
                        title="Eliminar"
                        @click.stop="deleteItem(item)"
                      >
                        <CIcon :content="cilTrash" />
                      </CButton>
                    </template>
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
    aria-labelledby="teacher-modal-title"
    @close="closeModal"
  >
    <CModalHeader class="bg-primary text-white border-0">
      <CModalTitle id="teacher-modal-title">
        {{ isEditMode ? 'Editar Profesor' : 'Crear Profesor' }}
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="isEditMode ? submitToEdit() : submitToCreate()">
        <CContainer>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormInput v-model="teacherData.dni" label="DNI" placeholder="Documento de identidad" required />
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput v-model="teacherData.name" label="Nombres" placeholder="Nombres" required />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormInput
                v-model="teacherData.surname_father"
                label="Apellido paterno"
                placeholder="Apellido paterno"
                required
              />
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput
                v-model="teacherData.surname_mother"
                label="Apellido materno"
                placeholder="Apellido materno"
                required
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormInput v-model="teacherData.address" label="Dirección" placeholder="Dirección" required />
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput
                v-model="teacherData.academic_degree"
                label="Título académico"
                placeholder="Título académico"
                required
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="6">
              <CFormLabel for="teacher-email">Email</CFormLabel>
              <div class="input-group">
                <input
                  id="teacher-email"
                  v-model="teacherData.email"
                  type="text"
                  class="form-control"
                  placeholder="usuario"
                  required
                />
                <span class="input-group-text">@ierp.edu.pe</span>
              </div>
            </CCol>
            <CCol xs="12" md="6">
              <CFormInput
                v-model="teacherData.password"
                label="Contraseña"
                type="password"
                :placeholder="isEditMode ? 'Dejar vacío para no cambiar' : 'Contraseña'"
                :required="!isEditMode"
                autocomplete="new-password"
              />
            </CCol>
          </CRow>
          <CRow class="mb-3 gy-3">
            <CCol xs="12" md="4">
              <CFormInput v-model="teacherData.birth_date" label="Fecha de nacimiento" type="date" required />
            </CCol>
            <CCol xs="12" md="4">
              <CFormLabel for="teacher-sex">Sexo</CFormLabel>
              <CFormSelect id="teacher-sex" v-model="teacherData.sex">
                <option disabled value="">Seleccionar una opción</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </CFormSelect>
            </CCol>
            <CCol xs="12" md="4">
              <CFormInput
                v-model="teacherData.phone"
                label="Teléfono"
                placeholder="987654321"
                maxlength="9"
                required
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

  <ModalTeacherClassrooms
    v-model:isOpenModal="isClassroomsModalOpen"
    :teacher="selectedTeacherForClassrooms"
  />
</template>

<script setup>
import TeacherService from '@/services/TeacherService';
import { computed, ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import ModalTeacherClassrooms from './modals/ModalTeacherClassrooms.vue';
import { cilPencil, cilTrash } from '@coreui/icons';
import { BRAND_COLOR, DANGER_COLOR } from '@/utils/brand';

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  assignmentOnly: {
    type: Boolean,
    default: false,
  },
});

const emptyHint = computed(() =>
  props.assignmentOnly
    ? 'Prueba otra búsqueda o espera a que se registren docentes.'
    : 'Prueba otra búsqueda o usa «Nuevo» para registrar un docente.',
);

const teachers = ref([]);
const isModalOpen = ref(false);
const isClassroomsModalOpen = ref(false);
const selectedTeacherForClassrooms = ref(null);
const isEditMode = ref(false);
const idItemSelected = ref(0);
const searchData = ref('');

const listColumns = computed(() => [
  { key: 'id', label: 'N°', center: true },
  { key: 'full_name', label: 'Nombre y apellidos' },
  { key: 'dni', label: 'DNI', center: true },
  { key: 'phone', label: 'Teléfono', hideOnMobile: true },
  { key: 'academic_degree', label: 'Título', hideOnMobile: true },
  { key: 'actions', label: 'Opciones', center: true },
]);

const emptyTeacher = () => ({
  name: '',
  surname_father: '',
  surname_mother: '',
  birth_date: '',
  dni: '',
  sex: 'M',
  phone: '',
  email: '',
  password: '',
  address: '',
  academic_degree: '',
});

const teacherData = ref(emptyTeacher());

const fullSurnames = (item) => {
  const value = [item?.surname_father, item?.surname_mother].filter(Boolean).join(' ');
  return value || '—';
};

onMounted(async () => {
  try {
    await listTeacherService();
  } catch (error) {
    console.error(error);
  }
});

const listTeacherService = async (data) => {
  const response = await TeacherService.getItems(data);
  teachers.value = response.data.data;
};

const openCreateModal = () => {
  clearDataModal();
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openClassroomsModal = (teacher) => {
  selectedTeacherForClassrooms.value = teacher;
  isClassroomsModalOpen.value = true;
};

const openEditModal = async (id) => {
  const response = await TeacherService.getItem(id);
  const row = { ...response.data.data };
  idItemSelected.value = row.id;
  const emailRaw = row.user?.email ?? '';
  delete row.user;
  teacherData.value = {
    ...emptyTeacher(),
    ...row,
    email: typeof emailRaw === 'string' ? emailRaw.replace('@ierp.edu.pe', '') : '',
    password: '',
  };
  isEditMode.value = true;
  isModalOpen.value = true;
};

const clearDataModal = () => {
  teacherData.value = emptyTeacher();
};

const closeModal = () => {
  isModalOpen.value = false;
  clearDataModal();
};

const submitToCreate = async () => {
  try {
    await TeacherService.createItem(teacherData.value);
    listTeacherService(searchData.value);
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Docente registrado con éxito.',
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
  teacherData.value.id = idItemSelected.value;
  try {
    const payload = { ...teacherData.value };
    if (!payload.password) {
      delete payload.password;
    }
    await TeacherService.updateItem(payload);
    listTeacherService(searchData.value);
    closeModal();
    Swal.fire({
      icon: 'success',
      title: 'Actualización exitosa',
      text: 'Docente actualizado con éxito.',
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

const deleteItem = async (item) => {
  const fullName = [item?.name, item?.surname_father, item?.surname_mother]
    .filter(Boolean)
    .join(' ');
  const label = fullName || 'este docente';
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: DANGER_COLOR,
      title: 'Eliminar Docente',
      html: `¿Está seguro de eliminar a <strong>${safeLabel}</strong>?`,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: DANGER_COLOR,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: BRAND_COLOR,
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await TeacherService.deleteItem(item.id);
      listTeacherService(searchData.value);
      Swal.fire({
        icon: 'success',
        title: 'Docente eliminado',
        text: `${label} ha sido eliminado exitosamente.`,
        confirmButtonColor: BRAND_COLOR,
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Docente. Por favor, inténtalo de nuevo.',
      confirmButtonColor: BRAND_COLOR,
    });
  }
};

watch(searchData, (newVal) => {
  listTeacherService(newVal);
});
</script>

<style scoped>
.teacher-crud__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
}

.teacher-crud__title {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  margin: 0;
  font-weight: var(--rp-weight-bold);
  color: var(--rp-brand-500);
  font-size: var(--rp-text-lg);
  line-height: var(--rp-leading-tight);
}

.teacher-crud__subtitle {
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
}

.teacher-name {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  max-width: 14rem;
}

.teacher-name__given {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.teacher-name__surnames {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.teacher-actions {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: var(--rp-space-1);
}

.teacher-actions__btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
}

@media (min-width: 768px) {
  .teacher-crud__title {
    font-size: var(--rp-text-xl);
  }

  .teacher-name {
    max-width: 18rem;
  }

  .teacher-actions {
    gap: var(--rp-space-2);
  }

  .teacher-actions__btn {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>

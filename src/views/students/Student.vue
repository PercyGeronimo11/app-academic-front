<template>
  <CContainer fluid class="px-2 px-md-3 student-crud">
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-3 px-md-4">
            <div class="student-crud__intro mb-3">
              <div class="student-crud__intro-text">
                <h4 class="student-crud__title mb-1">
                  <i class="fas fa-users" aria-hidden="true"></i>
                  Lista de alumnos
                </h4>
                <p class="student-crud__subtitle mb-0">
                  Alta, edición, importación y búsqueda de estudiantes.
                </p>
              </div>
              <div class="student-crud__header-actions d-none d-lg-flex">
                <CButton color="primary" @click="goNewStudent">
                  <i class="fas fa-plus me-2" aria-hidden="true"></i>
                  Nuevo
                </CButton>
                <CButton color="info" class="text-white" @click="openImportStudentsModal">
                  Importar
                </CButton>
              </div>
            </div>

            <CRow class="g-2 align-items-end">
              <CCol xs="12" md="6" lg="4">
                <CFormInput
                  v-model="searchData"
                  label="Buscar"
                  placeholder="Nombres, apellidos o DNI"
                  aria-label="Buscar por nombres, apellidos o DNI"
                  @keyup.enter="applyFilters"
                />
              </CCol>
              <CCol xs="6" md="3" lg="2">
                <CFormSelect
                  v-model="filterGrade"
                  label="Grado"
                  aria-label="Filtrar por grado"
                  @change="applyFilters"
                >
                  <option value="">Todos</option>
                  <option
                    v-for="(g, idx) in gradeOptions"
                    :key="'grade-' + idx"
                    :value="g"
                  >
                    {{ g }}
                  </option>
                </CFormSelect>
              </CCol>
              <CCol xs="6" md="3" lg="2">
                <CFormSelect
                  v-model="filterSection"
                  label="Sección"
                  aria-label="Filtrar por sección"
                  @change="applyFilters"
                >
                  <option value="">Todas</option>
                  <option
                    v-for="(s, idx) in sectionOptions"
                    :key="'sec-' + idx"
                    :value="s"
                  >
                    {{ s }}
                  </option>
                </CFormSelect>
              </CCol>
              <CCol xs="12" md="12" lg="4" class="d-flex flex-wrap gap-2">
                <CButton type="button" color="primary" @click="applyFilters">
                  Buscar
                </CButton>
                <CButton type="button" color="secondary" variant="outline" @click="clearFilters">
                  Limpiar
                </CButton>
              </CCol>
              <CCol xs="12" class="d-lg-none d-flex flex-wrap gap-2">
                <CButton color="primary" class="flex-grow-1" @click="goNewStudent">
                  <i class="fas fa-plus me-2" aria-hidden="true"></i>
                  Nuevo
                </CButton>
                <CButton color="info" class="text-white flex-grow-1" @click="openImportStudentsModal">
                  Importar
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
                :data="alumnos"
                empty-message="No hay estudiantes que coincidan con la búsqueda o los filtros."
                empty-hint="Ajusta los criterios, limpia los filtros o registra un nuevo estudiante."
                empty-icon="👥"
              >
                <template #full_name="{ item }">
                  <div class="student-name">
                    <span class="student-name__given">{{ item.name || '—' }}</span>
                    <span class="student-name__surnames">{{ fullSurnames(item) }}</span>
                  </div>
                </template>

                <template #aula="{ item }">
                  <span class="student-aula">{{ formatAula(item) }}</span>
                </template>

                <template #apoderado="{ item }">
                  <span class="student-apoderado">{{ apoderadoName(item) }}</span>
                </template>

                <template #actions="{ item }">
                  <div class="student-actions">
                    <CButton
                      color="warning"
                      size="sm"
                      class="text-white student-actions__btn"
                      title="Editar"
                      @click.stop="navigateToEditStudent(item.id)"
                    >
                      <CIcon :content="cilPencil" />
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      class="text-white student-actions__btn"
                      title="Eliminar"
                      @click.stop="deleteItem(item)"
                    >
                      <CIcon :content="cilTrash" />
                    </CButton>
                  </div>
                </template>
              </ElegantCrudList>

              <div
                v-if="meta.total > 0"
                class="modern-list-pagination-bar d-flex flex-wrap justify-content-between align-items-center gap-2"
              >
                <small class="text-body-secondary">
                  Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ meta.total }}
                </small>
                <CPagination class="mb-0 flex-wrap" aria-label="Paginación de estudiantes">
                  <CPaginationItem
                    href="#"
                    :disabled="meta.current_page <= 1"
                    aria-label="Anterior"
                    @click.prevent="goPage(meta.current_page - 1)"
                  >
                    ‹
                  </CPaginationItem>
                  <CPaginationItem
                    v-for="p in visiblePages"
                    :key="p"
                    href="#"
                    :active="p === meta.current_page"
                    @click.prevent="goPage(p)"
                  >
                    {{ p }}
                  </CPaginationItem>
                  <CPaginationItem
                    href="#"
                    :disabled="meta.current_page >= meta.last_page"
                    aria-label="Siguiente"
                    @click.prevent="goPage(meta.current_page + 1)"
                  >
                    ›
                  </CPaginationItem>
                </CPagination>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>

  <ImportStudents v-model:isOpenModal="isOpenModalImportStudents" @updateData="onImportFinished" />
</template>

<script setup>
import StudentService from '@/services/StudentService';
import GradeSectionService from '@/services/GradeSectionService';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import ImportStudents from './ImportStudents.vue';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import { cilPencil, cilTrash } from '@coreui/icons';
import { BRAND_COLOR, DANGER_COLOR } from '@/utils/brand';

const isOpenModalImportStudents = ref(false);
const alumnos = ref([]);
const searchData = ref('');
const filterGrade = ref('');
const filterSection = ref('');
const gradeOptions = ref([]);
const sectionOptions = ref([]);
const currentPage = ref(1);
const perPage = ref(15);
const meta = ref({
  total: 0,
  current_page: 1,
  per_page: 15,
  last_page: 1,
});

const router = useRouter();
const listColumns = computed(() => [
  { key: 'id', label: 'N°' },
  { key: 'full_name', label: 'Nombre y apellidos' },
  { key: 'dni', label: 'DNI', hideOnMobile: true },
  { key: 'aula', label: 'Grado' },
  { key: 'apoderado', label: 'Apoderado', hideOnMobile: true },
  { key: 'actions', label: 'Opciones', center: true },
]);

const fullSurnames = (item) => {
  const value = [item?.surname_father, item?.surname_mother].filter(Boolean).join(' ');
  return value || '—';
};

const apoderadoName = (item) => {
  const value = String(item?.representative_name || '').trim();
  return value || '—';
};

const formatAula = (item) => {
  const grade = item?.grade_section?.grade ?? item?.grade ?? '';
  const section = item?.grade_section?.section ?? item?.section ?? '';
  if (!grade && !section) return '—';
  return `${grade || '—'}° ${section || '—'}`.trim();
};

onMounted(async () => {
  try {
    await Promise.all([loadGradeSectionOptions(), listStudentService()]);
  } catch (error) {
    console.error(error);
  }
});

const loadGradeSectionOptions = async () => {
  const [gradesRes, sectionsRes] = await Promise.all([
    GradeSectionService.getGrades(),
    GradeSectionService.getSections(),
  ]);
  gradeOptions.value = gradesRes.data.data || [];
  sectionOptions.value = sectionsRes.data.data || [];
};

const openImportStudentsModal = () => {
  isOpenModalImportStudents.value = true;
};

const onImportFinished = async () => {
  currentPage.value = 1;
  await listStudentService();
};

const buildListParams = () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
  };
  const s = searchData.value?.trim();
  if (s) {
    params.search = s;
  }
  if (filterGrade.value) {
    params.grade = filterGrade.value;
  }
  if (filterSection.value) {
    params.section = filterSection.value;
  }
  return params;
};

const listStudentService = async () => {
  const response = await StudentService.getItems(buildListParams());
  const rows = response.data.data || [];
  alumnos.value = rows;
  if (response.data.meta) {
    meta.value = response.data.meta;
  } else {
    meta.value = {
      total: rows.length,
      current_page: 1,
      per_page: rows.length || perPage.value,
      last_page: 1,
    };
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  listStudentService();
};

const clearFilters = () => {
  searchData.value = '';
  filterGrade.value = '';
  filterSection.value = '';
  currentPage.value = 1;
  listStudentService();
};

const goPage = (p) => {
  if (p < 1 || p > meta.value.last_page) {
    return;
  }
  currentPage.value = p;
  listStudentService();
};

const visiblePages = computed(() => {
  const last = meta.value.last_page || 1;
  const cur = meta.value.current_page || 1;
  const windowSize = 5;
  let start = Math.max(1, cur - Math.floor(windowSize / 2));
  let end = Math.min(last, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }
  return pages;
});

const rangeStart = computed(() => {
  if (!meta.value.total) {
    return 0;
  }
  return (meta.value.current_page - 1) * meta.value.per_page + 1;
});

const rangeEnd = computed(() => {
  return Math.min(meta.value.current_page * meta.value.per_page, meta.value.total);
});

const goNewStudent = () => {
  router.push({ name: 'NuevoEstudiante' });
};

const navigateToEditStudent = (id) => {
  return router.push({
    name: 'editStudent',
    params: { id },
  });
};

const deleteItem = async (item) => {
  const fullName = [item?.name, item?.surname_father, item?.surname_mother]
    .filter(Boolean)
    .join(' ');
  const label = fullName || 'este alumno';
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: DANGER_COLOR,
      title: 'Eliminar Alumno',
      html: `¿Está seguro de eliminar a <strong>${safeLabel}</strong>?`,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: DANGER_COLOR,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: BRAND_COLOR,
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await StudentService.deleteItem(item.id);
      await listStudentService();
      Swal.fire({
        icon: 'success',
        title: 'Alumno eliminado',
        text: `${label} ha sido eliminado exitosamente.`,
        confirmButtonColor: BRAND_COLOR,
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Alumno. Por favor, inténtalo de nuevo.',
      confirmButtonColor: BRAND_COLOR,
    });
  }
};
</script>

<style scoped>
.student-crud__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-3);
}

.student-crud__title {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  margin: 0;
  font-weight: var(--rp-weight-bold);
  color: var(--rp-brand-500);
  font-size: var(--rp-text-lg);
  line-height: var(--rp-leading-tight);
}

.student-crud__subtitle {
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  line-height: var(--rp-leading-normal);
}

.student-crud__header-actions {
  gap: var(--rp-space-2);
  flex-wrap: wrap;
}

.student-name {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  max-width: 14rem;
  text-align: left;
}

.student-name__given {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.student-name__surnames {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
}

.student-aula {
  display: block;
  font-weight: var(--rp-weight-semibold);
  white-space: nowrap;
  text-align: left;
}

.student-apoderado {
  display: block;
  max-width: 14rem;
  font-size: var(--rp-text-sm);
  color: var(--rp-text);
  line-height: var(--rp-leading-snug);
  overflow-wrap: anywhere;
  text-align: left;
}

.student-actions {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--rp-space-1);
  justify-items: center;
  align-items: center;
  width: 100%;
  max-width: 5.5rem;
  margin-inline: auto;
}

.student-actions__btn {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0.25rem 0.4rem;
}

@media (min-width: 768px) {
  .student-crud__title {
    font-size: var(--rp-text-xl);
  }

  .student-name {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    max-width: none;
  }

  .student-name__given,
  .student-name__surnames {
    font-size: inherit;
    line-height: var(--rp-leading-normal);
    overflow-wrap: normal;
    white-space: nowrap;
  }

  .student-name__surnames {
    color: var(--rp-text-heading);
    font-weight: var(--rp-weight-semibold);
  }

  .student-apoderado {
    max-width: 16rem;
  }

  .student-actions {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    gap: var(--rp-space-2);
    width: auto;
    max-width: none;
  }

  .student-actions__btn {
    min-width: 2.25rem;
    min-height: 2.25rem;
  }
}
</style>

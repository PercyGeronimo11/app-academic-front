<template>
  <CContainer fluid class="px-2 px-md-3">
    <!-- Tarjeta: título y filtros -->
    <CRow class="mb-3">
      <CCol>
        <CCard class="shadow-sm border-0">
          <CCardBody class="py-3 px-4">
            <div class="mb-3">
              <h4 class="fw-bold text-primary mb-0 d-flex align-items-center">
                <i class="fas fa-users me-2"></i>
                Lista de alumnos
              </h4>
            </div>
            <CRow class="g-2 align-items-end">
              <CCol xs="12" md="6" lg="3">
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
              <CCol xs="12" md="6" lg="3" class="d-flex flex-wrap gap-2">
                <CButton type="button" color="primary" @click="applyFilters">
                  Buscar
                </CButton>
                <CButton type="button" color="secondary" variant="outline" @click="clearFilters">
                  Limpiar
                </CButton>
              </CCol>
              <CCol
                xs="12"
                lg="2"
                class="d-flex flex-wrap gap-2 justify-content-lg-end"
              >
                <CButton color="success" class="text-white" @click="goNewStudent">
                  Nuevo estudiante
                </CButton>
                <CButton color="info" class="text-white" @click="openImportStudentsModal">
                  Importar
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Tarjeta: tabla y paginación -->
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
                <template #actions="{ item }">
                  <CButton color="warning" class="text-white" @click.stop="navigateToEditStudent(item.user_id)">
                    <CIcon :content="cilPencil" size="lg"></CIcon>
                  </CButton>
                  <CButton color="danger" class="text-white" @click.stop="deleteItem(item.user_id)">
                    <CIcon :content="cilTrash" size="lg"></CIcon>
                  </CButton>
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
import StudentService from '@/services/StudentService'
import GradeSectionService from '@/services/GradeSectionService'
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2'
import ImportStudents from './ImportStudents.vue';
import ElegantCrudList from '@/components/cruds/ElegantCrudList.vue';
import { cilPencil, cilTrash } from '@coreui/icons';

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
const listColumns = ref([
  { key: 'id', label: 'N°' },
  { key: 'surnames', label: 'Apellidos' },
  { key: 'name', label: 'Nombres' },
  { key: 'dni', label: 'DNI' },
  { key: 'grade_section.grade', label: 'Grado' },
  { key: 'grade_section.section', label: 'Sección' },
  { key: 'actions', label: 'OPCIONES' },
]);

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
  alumnos.value = rows.map((row) => ({
    ...row,
    surnames: [row.surname_father, row.surname_mother].filter(Boolean).join(' ').trim() || '—',
  }));
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

const navigateToEditStudent = async (id) => {
  return router.push({
    name: 'editStudent',
    params: { id }
  });
};

const deleteItem = async (id) => {
  try {
    const confirmResult = await Swal.fire({
      icon: 'question',
      iconColor: '#E55353',
      title: 'Eliminar Alumno',
      text: '¿Estás seguro que desea eliminar este alumno?',
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#E55353',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#39F',
      reverseButtons: true,
    });
    if (confirmResult.isConfirmed) {
      await StudentService.deleteItem(id);
      await listStudentService();
      Swal.fire({
        icon: 'success',
        title: 'Alumno eliminado',
        text: 'El alumno ha sido eliminado exitosamente.',
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al eliminar el Alumno. Por favor, inténtalo de nuevo.',
    });
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

.input-group .input-group-text {
  border-radius: 0 0.25rem 0.25rem 0;
}
</style>

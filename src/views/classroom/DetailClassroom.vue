<template>
  <div class="module-page classroom-detail">
    <ModulePageHeader
      icon="fas fa-users"
      :title="`Aula ${gradeName} ${sectionName}`"
      subtitle="Listado de alumnos, profesores asignados e importación de notas SIAGIE."
    >
      <template #actions>
        <CButton color="success" class="text-white" @click="openImportModal">
          <i class="fas fa-file-excel me-2"></i>Importar notas SIAGIE
        </CButton>
        <CButton color="light" variant="outline" class="text-white border-white" @click="openTeachersModal">
          <i class="fas fa-chalkboard-teacher me-2"></i>Ver profesores
        </CButton>
      </template>
    </ModulePageHeader>

    <div class="module-card mb-4">
      <div class="module-card__body">
        <CInputGroup>
          <CFormInput
            v-model="searchData"
            placeholder="Buscar por apellido, nombre o DNI"
            aria-label="Buscar por apellido, nombre o DNI"
          />
          <CButton type="button" color="primary">
            <i class="fas fa-search me-1"></i>Buscar
          </CButton>
        </CInputGroup>
      </div>
    </div>

    <div class="modern-table-shell">
      <CTable align="middle" class="mb-0" hover responsive>
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell class="text-center">#</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Nombres y apellidos</CTableHeaderCell>
            <CTableHeaderCell class="text-center">DNI</CTableHeaderCell>
            <CTableHeaderCell class="text-center">N° celular</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <template v-if="!listStudents.length">
            <CTableRow>
              <CTableDataCell colspan="4" class="table-empty-cell">
                <EmptyState
                  icon="👥"
                  title="Sin alumnos registrados"
                  hint="No hay estudiantes en esta aula todavía."
                  compact
                />
              </CTableDataCell>
            </CTableRow>
          </template>
          <template v-else>
            <CTableRow v-for="item in listStudents" :key="item.id ?? item.dni">
              <CTableDataCell class="text-center">{{ item.id }}</CTableDataCell>
              <CTableDataCell class="text-center fw-medium">{{ item.name }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.dni }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.representative_phone || '—' }}</CTableDataCell>
            </CTableRow>
          </template>
        </CTableBody>
      </CTable>
    </div>

    <CModal
      :visible="isTeachersModalOpen"
      scrollable
      size="lg"
      alignment="center"
      backdrop="static"
      @close="closeTeachersModal"
    >
      <CModalHeader class="border-0 pb-0">
        <CModalTitle>
          <i class="fas fa-chalkboard-teacher text-primary me-2"></i>
          Profesores del aula {{ gradeName }} {{ sectionName }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="loadingTeachers" class="module-loading py-4">
          <i class="fas fa-spinner fa-spin"></i> Cargando profesores...
        </div>
        <div v-else class="modern-table-shell">
          <CTable hover align="middle" class="mb-0" responsive>
            <CTableHead class="modern-table-header">
              <CTableRow>
                <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Curso</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Profesor</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-if="!classroomTeachers.length">
                <CTableDataCell colspan="3" class="table-empty-cell">
                  <EmptyState
                    icon="📚"
                    title="Sin cursos asignados"
                    hint="No hay profesores vinculados a esta aula."
                    compact
                  />
                </CTableDataCell>
              </CTableRow>
              <CTableRow
                v-for="(item, index) in classroomTeachers"
                :key="item.course_class_id"
              >
                <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                <CTableDataCell class="text-center fw-medium">{{ item.course_name }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  {{ item.teacher_name || 'Sin asignar' }}
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton type="button" color="secondary" variant="ghost" @click="closeTeachersModal">
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>

    <ImportSiagieGradesModal
      :visible="isImportModalOpen"
      :grade-section-id="Number(idGradeSection)"
      @close="closeImportModal"
      @imported="closeImportModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StudentService from '@/services/StudentService';
import CourseClassService from '@/services/CourseClassService';
import ImportSiagieGradesModal from '@/views/grades/ImportSiagieGradesModal.vue';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const route = useRoute();

const gradeName = route.params.grade;
const sectionName = route.params.section;
const idGradeSection = route.params.id;

const listStudents = ref([]);
const searchData = ref('');
const isTeachersModalOpen = ref(false);
const isImportModalOpen = ref(false);
const classroomTeachers = ref([]);
const loadingTeachers = ref(false);

const listStudentService = async () => {
  const response = await StudentService.getItemsByGradeAndSection(idGradeSection);
  listStudents.value = response.data.data;
};

const loadClassroomTeachers = async () => {
  loadingTeachers.value = true;
  classroomTeachers.value = [];

  try {
    const response = await CourseClassService.listCoursesByIdGradeSection(idGradeSection);
    classroomTeachers.value = (response.data?.data ?? []).filter(
      (course) => course?.course_name
    );
  } catch {
    classroomTeachers.value = [];
  } finally {
    loadingTeachers.value = false;
  }
};

const openTeachersModal = async () => {
  isTeachersModalOpen.value = true;
  await loadClassroomTeachers();
};

const closeTeachersModal = () => {
  isTeachersModalOpen.value = false;
};

const openImportModal = () => {
  isImportModalOpen.value = true;
};

const closeImportModal = () => {
  isImportModalOpen.value = false;
};

onMounted(() => {
  listStudentService();
});
</script>

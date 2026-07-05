<template>
<div>
    <div class="mb-2">
      <h1>Lista de Alumnos de {{ gradeName }} {{ sectionName }}</h1>
      <CRow class="mb-3">
        <CCol>
          <CInputGroup>
            <CFormInput v-model="searchData" placeholder="Buscar por apellido, nombre o DNI"
              aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2" />
            <CButton type="button" color="primary" id="button-addon2">Buscar</CButton>
          </CInputGroup>
        </CCol>
        <CCol></CCol>
        <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
          <CButton type="button" color="info" class="text-white" @click="openTeachersModal">
            Ver profesores
          </CButton>
        </CCol>
      </CRow>
    </div>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            #
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Nombres y apellidos
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            DNI
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            N° celular
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <template v-if="!listStudents.length">
          <CTableRow>
            <CTableDataCell colspan="4" class="list-empty-message py-4">
              No hay registros para mostrar.
            </CTableDataCell>
          </CTableRow>
        </template>
        <template v-else>
          <CTableRow v-for="item in listStudents" :key="item.id ?? item.dni">
            <CTableDataCell>
              <div class="text-center">{{ item.id }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.name }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.dni }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ item.representative_phone }}</div>
            </CTableDataCell>
          </CTableRow>
        </template>
      </CTableBody>
    </CTable>

    <CModal
      :visible="isTeachersModalOpen"
      scrollable
      size="lg"
      alignment="center"
      backdrop="static"
      @close="closeTeachersModal"
    >
      <CModalHeader>
        <CModalTitle>
          Profesores del aula {{ gradeName }} {{ sectionName }}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div v-if="loadingTeachers" class="text-center py-4 text-body-secondary">
          Cargando profesores...
        </div>
        <div v-else class="table-responsive border rounded">
          <CTable hover align="middle" class="mb-0">
            <CTableHead class="table-light">
              <CTableRow>
                <CTableHeaderCell class="text-center">N°</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Curso</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Profesor</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-if="!classroomTeachers.length">
                <CTableDataCell colspan="3" class="text-center text-body-secondary py-4">
                  No hay cursos o profesores asignados en esta aula.
                </CTableDataCell>
              </CTableRow>
              <CTableRow
                v-for="(item, index) in classroomTeachers"
                :key="item.course_class_id"
              >
                <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                <CTableDataCell class="text-center">{{ item.course_name }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  {{ item.teacher_name || 'Sin asignar' }}
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton type="button" color="secondary" @click="closeTeachersModal">
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StudentService from '@/services/StudentService';
import CourseClassService from '@/services/CourseClassService';

const route = useRoute();

const gradeName = route.params.grade;
const sectionName = route.params.section;
const idGradeSection = route.params.id;

const listStudents = ref([]);
const searchData = ref('');
const isTeachersModalOpen = ref(false);
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

onMounted(() => {
  listStudentService();
});
</script>

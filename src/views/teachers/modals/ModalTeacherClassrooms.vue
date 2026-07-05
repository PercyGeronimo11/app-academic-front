<template>
  <CModal
    :visible="isOpenModal"
    scrollable
    size="lg"
    alignment="center"
    backdrop="static"
    @close="closeModal"
  >
    <CModalHeader>
      <CModalTitle>Lista de aulas a cargo</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <p v-if="teacher" class="text-body-secondary mb-3">
        Docente:
        <strong>{{ teacherFullName }}</strong>
      </p>

      <CRow class="g-3 align-items-end mb-4">
        <CCol xs="12" md="3">
          <CFormLabel for="teacher-classroom-grade">Grado</CFormLabel>
          <select
            id="teacher-classroom-grade"
            :key="`grade-${formKey}`"
            v-model="selectedGrade"
            class="form-select"
            @change="onGradeChange"
          >
            <option value="">Seleccione</option>
            <option v-for="grade in gradeOptions" :key="grade" :value="grade">
              {{ grade }}
            </option>
          </select>
        </CCol>

        <CCol xs="12" md="3">
          <CFormLabel for="teacher-classroom-section">Sección</CFormLabel>
          <select
            id="teacher-classroom-section"
            :key="`section-${formKey}`"
            v-model="selectedSection"
            class="form-select"
            :disabled="!selectedGrade"
            @change="onSectionChange"
          >
            <option value="">Seleccione</option>
            <option v-for="section in sectionOptions" :key="section" :value="section">
              {{ section }}
            </option>
          </select>
        </CCol>

        <CCol xs="12" md="4">
          <CFormLabel for="teacher-classroom-course">Curso</CFormLabel>
          <select
            id="teacher-classroom-course"
            :key="`course-${formKey}-${courseSelectKey}`"
            v-model="selectedCourseClassId"
            class="form-select"
            :disabled="!selectedSection || loadingCourses"
          >
            <option value="">
              {{ loadingCourses ? 'Cargando cursos...' : 'Seleccione' }}
            </option>
            <option
              v-for="course in availableCourses"
              :key="course.course_class_id"
              :value="String(course.course_class_id)"
            >
              {{ course.course_name }}
            </option>
          </select>
        </CCol>

        <CCol xs="12" md="2" class="d-grid">
          <CButton
            type="button"
            color="warning"
            class="text-dark"
            :disabled="!canAddAssignment"
            @click="addAssignment"
          >
            Agregar
          </CButton>
        </CCol>
      </CRow>

      <div class="table-responsive border rounded">
        <CTable hover align="middle" class="mb-0">
          <CTableHead class="table-light">
            <CTableRow>
              <CTableHeaderCell class="text-center">Grado</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Sección</CTableHeaderCell>
              <CTableHeaderCell class="text-center">Curso</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px;">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="!assignments.length">
              <CTableDataCell colspan="4" class="text-center text-body-secondary py-4">
                No hay aulas asignadas.
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-for="(item, index) in assignments" :key="item.course_class_id">
              <CTableDataCell class="text-center">{{ item.grade }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.section }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.course_name }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton
                  type="button"
                  color="danger"
                  size="sm"
                  class="text-white"
                  @click="removeAssignment(index)"
                >
                  <CIcon :content="cilTrash" size="sm" />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CModalBody>

    <CModalFooter>
      <CButton type="button" color="secondary" @click="closeModal">
        Cancelar
      </CButton>
      <CButton type="button" color="primary" :disabled="saving" @click="saveAssignments">
        {{ saving ? 'Guardando...' : 'Guardar' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Swal from 'sweetalert2';
import { cilTrash } from '@coreui/icons';
import CourseClassService from '@/services/CourseClassService';
import GradeSectionService from '@/services/GradeSectionService';

const emit = defineEmits(['update:isOpenModal', 'saved']);

const props = defineProps({
  isOpenModal: {
    type: Boolean,
    required: true,
  },
  teacher: {
    type: Object,
    default: null,
  },
});

const gradeSections = ref([]);
const assignments = ref([]);
const availableCourses = ref([]);
const selectedGrade = ref('');
const selectedSection = ref('');
const selectedCourseClassId = ref('');
const loadingCourses = ref(false);
const saving = ref(false);
const isShowingAlert = ref(false);
const formKey = ref(0);
const courseSelectKey = ref(0);

const teacherFullName = computed(() => {
  if (!props.teacher) return '';
  return [
    props.teacher.name,
    props.teacher.surname_father,
    props.teacher.surname_mother,
  ].filter(Boolean).join(' ');
});

const gradeOptions = computed(() => [
  ...new Set(gradeSections.value.map((item) => String(item.grade))),
]);

const sectionOptions = computed(() => {
  if (!selectedGrade.value) return [];
  return [
    ...new Set(
      gradeSections.value
        .filter((item) => String(item.grade) === String(selectedGrade.value))
        .map((item) => String(item.section))
    ),
  ];
});

const gradeSectionId = computed(() => {
  if (!selectedGrade.value || !selectedSection.value) return null;

  const match = gradeSections.value.find(
    (item) =>
      String(item.grade) === String(selectedGrade.value) &&
      String(item.section) === String(selectedSection.value)
  );

  return match?.id ?? null;
});

const canAddAssignment = computed(() => {
  const courseId = String(selectedCourseClassId.value ?? '').trim();
  return Boolean(
    selectedGrade.value &&
    selectedSection.value &&
    courseId &&
    !loadingCourses.value
  );
});

const resetSelectors = () => {
  selectedGrade.value = '';
  selectedSection.value = '';
  selectedCourseClassId.value = '';
  availableCourses.value = [];
  loadingCourses.value = false;
};

const loadGradeSections = async () => {
  const response = await GradeSectionService.getGradeSections();
  gradeSections.value = response.data?.data ?? [];
};

const loadTeacherAssignments = async () => {
  if (!props.teacher?.id) {
    assignments.value = [];
    return;
  }

  try {
    const response = await CourseClassService.listCoursesByTeacherId(props.teacher.id);
    assignments.value = (response.data?.data ?? []).map((item) => ({ ...item }));
  } catch {
    assignments.value = [];
  }
};

const loadCoursesForGradeSection = async () => {
  selectedCourseClassId.value = '';
  availableCourses.value = [];

  if (!gradeSectionId.value) return;

  loadingCourses.value = true;
  courseSelectKey.value += 1;

  try {
    const response = await CourseClassService.listCoursesByIdGradeSection(gradeSectionId.value);
    availableCourses.value = (response.data?.data ?? []).filter(
      (course) => course?.course_class_id != null && course?.course_name
    );
  } catch {
    availableCourses.value = [];
  } finally {
    loadingCourses.value = false;
  }
};

const onGradeChange = () => {
  selectedSection.value = '';
  selectedCourseClassId.value = '';
  availableCourses.value = [];
};

const onSectionChange = async () => {
  selectedCourseClassId.value = '';
  await loadCoursesForGradeSection();
};

const addAssignment = () => {
  const course = availableCourses.value.find(
    (item) => String(item.course_class_id) === String(selectedCourseClassId.value)
  );

  if (!course) {
    isShowingAlert.value = true;
    Swal.fire({
      icon: 'warning',
      title: 'Seleccione un curso',
      text: 'Debe elegir un curso válido para agregar.',
    }).finally(() => {
      isShowingAlert.value = false;
    });
    return;
  }

  const exists = assignments.value.some(
    (item) => String(item.course_class_id) === String(course.course_class_id)
  );

  if (exists) {
    isShowingAlert.value = true;
    Swal.fire({
      icon: 'info',
      title: 'Registro duplicado',
      text: 'Ese grado, sección y curso ya están en la lista.',
    }).finally(() => {
      isShowingAlert.value = false;
    });
    return;
  }

  assignments.value.push({
    course_class_id: course.course_class_id,
    course_id: course.course_id,
    course_name: course.course_name,
    grade: selectedGrade.value,
    section: selectedSection.value,
    grade_section_id: gradeSectionId.value,
  });

  selectedCourseClassId.value = '';
};

const removeAssignment = (index) => {
  assignments.value.splice(index, 1);
};

const saveAssignments = async () => {
  if (!props.teacher?.id) return;

  saving.value = true;
  try {
    const payload = {
      teacher_id: props.teacher.id,
      assignments: assignments.value.map((item) => ({
        course_class_id: item.course_class_id,
        course_id: item.course_id,
      })),
    };

    const response = await CourseClassService.saveAssignmentTeachers(payload);
    if (response.data?.success) {
      emit('saved');
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Asignación guardada',
        text: response.data.message || 'Las aulas fueron asignadas correctamente.',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.data?.message || 'No se pudo guardar la asignación.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'No se pudo guardar la asignación.',
    });
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  if (isShowingAlert.value) return;
  emit('update:isOpenModal', false);
};

watch(
  () => [props.isOpenModal, props.teacher?.id],
  async ([open, teacherId]) => {
    if (!open) {
      resetSelectors();
      assignments.value = [];
      return;
    }

    if (!teacherId) return;

    formKey.value += 1;
    resetSelectors();
    await loadGradeSections();
    await loadTeacherAssignments();
  }
);
</script>

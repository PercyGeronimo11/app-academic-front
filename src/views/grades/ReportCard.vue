<template>
  <div class="module-page report-card">
    <ModulePageHeader
      icon="fas fa-book-open"
      title="Libreta de notas"
      :subtitle="studentSubtitle"
    >
      <template #actions>
        <CButton color="primary" variant="outline" @click="generatePDF">
          <i class="fas fa-file-pdf me-2"></i>Descargar PDF
        </CButton>
      </template>
    </ModulePageHeader>

    <div class="module-filter-bar">
      <div style="max-width: 280px">
        <CFormLabel for="bimester">Bimestre</CFormLabel>
        <CFormSelect
          id="bimester"
          :model-value="selectedBimesterId"
          @update:model-value="onBimesterChange"
        >
          <option v-for="item in bimesters" :key="item.id" :value="Number(item.id)">
            {{ item.name }} ({{ item.year }})
          </option>
        </CFormSelect>
      </div>
    </div>

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando libreta...
    </div>

    <EmptyState
      v-else-if="!courses.length"
      icon="📖"
      title="Sin notas en este bimestre"
      hint="Las calificaciones aparecerán cuando el docente importe las notas desde SIAGIE."
    />

    <div v-else class="d-flex flex-column gap-3">
      <article v-for="course in courses" :key="course.course_id" class="report-course-card">
        <header class="report-course-card__header">
          <i class="fas fa-book me-2"></i>{{ course.course_name }}
        </header>
        <div class="modern-table-shell" style="border: none; box-shadow: none; border-radius: 0">
          <CTable hover responsive class="mb-0">
            <CTableHead class="modern-table-header">
              <CTableRow>
                <CTableHeaderCell>Competencia</CTableHeaderCell>
                <CTableHeaderCell class="text-center">NL</CTableHeaderCell>
                <CTableHeaderCell>Conclusión descriptiva</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(item, index) in course.competencies" :key="index">
                <CTableDataCell>
                  <div class="fw-semibold">{{ item.competency_number || item.competency_code }}</div>
                  <div class="small text-body-secondary">{{ item.competency_name }}</div>
                </CTableDataCell>
                <CTableDataCell class="text-center">
                  <ScoreLevelBadge :score="item.score" />
                </CTableDataCell>
                <CTableDataCell class="small">{{ item.description || item.observations || '—' }}</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import CompetencyScoreService from '@/services/CompetencyScoreService';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';
import ScoreLevelBadge from '@/components/academic/ScoreLevelBadge.vue';
import { pickCurrentBimesterId } from '@/utils/bimester';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const bimesters = ref([]);
const selectedBimesterId = ref(null);
const studentInfo = ref(null);
const courses = ref([]);
const loading = ref(true);
const loadError = ref('');

const studentSubtitle = computed(() => {
  if (!studentInfo.value) return 'Consulte su rendimiento académico por bimestre';
  const parts = [studentInfo.value.name];
  if (studentInfo.value.grade_section?.label) {
    parts.push(studentInfo.value.grade_section.label);
  }
  return parts.join(' · ');
});

const loadBimesters = async () => {
  const response = await CompetencyScoreService.listBimesters();
  bimesters.value = response.data?.data || [];
  if (bimesters.value.length && !selectedBimesterId.value) {
    selectedBimesterId.value = pickCurrentBimesterId(bimesters.value);
  }
};

const onBimesterChange = async (value) => {
  selectedBimesterId.value = value != null && value !== '' ? Number(value) : null;
  await loadReportCard();
};

const loadReportCard = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await CompetencyScoreService.reportCard(selectedBimesterId.value);
    if (response.data.success) {
      const data = response.data.data;
      studentInfo.value = data.student;
      courses.value = data.courses || [];
    } else {
      loadError.value = response.data.message || 'No se pudo cargar la libreta.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar la libreta.';
  } finally {
    loading.value = false;
  }
};

const generatePDF = () => {
  const doc = new jsPDF();
  const bimester = bimesters.value.find(
    (b) => Number(b.id) === Number(selectedBimesterId.value)
  );
  doc.setFontSize(16);
  doc.text('Libreta de notas', 14, 15);
  doc.setFontSize(11);
  doc.text(studentInfo.value?.name || 'Estudiante', 14, 24);
  doc.text(bimester ? `${bimester.name} (${bimester.year})` : '', 14, 30);

  let y = 38;
  courses.value.forEach((course) => {
    doc.setFontSize(12);
    doc.text(course.course_name, 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [['Competencia', 'NL', 'Conclusión descriptiva']],
      body: course.competencies.map((item) => [
        `${item.competency_number || item.competency_code} - ${item.competency_name}`,
        item.score || '—',
        item.description || item.observations || '—',
      ]),
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  });

  doc.save('libreta-notas.pdf');
};

onMounted(async () => {
  await loadBimesters();
  await loadReportCard();
});
</script>

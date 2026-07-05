<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <h5 class="fw-bold text-primary mb-0">
            <i class="fas fa-filter me-2 text-primary"></i>
            Filtros de consulta
          </h5>
        </CCardHeader>
        <CCardBody class="py-3 px-4">
          <CRow class="g-3 align-items-end">
            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Año escolar</CFormLabel>
              <CFormSelect
                :model-value="store.filters.schoolYear"
                :disabled="store.loading || store.updating"
                @change="handleSchoolYearChange"
              >
                <option v-for="year in store.schoolYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Bimestre</CFormLabel>
              <CFormSelect
                :model-value="store.filters.bimester"
                :disabled="store.loading || store.updating || !store.bimesters.length"
                @change="handleBimesterChange"
              >
                <option v-for="item in store.bimesters" :key="item.id" :value="item.number">
                  {{ item.name }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Aula</CFormLabel>
              <CFormSelect
                :model-value="store.filters.gradeSectionId"
                :disabled="store.loading || store.updating || !store.gradeSections.length"
                @change="handleGradeSectionChange"
              >
                <option v-for="item in store.gradeSections" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Alumno (opcional)</CFormLabel>
              <CFormSelect
                :model-value="store.filters.studentId || ''"
                :disabled="store.loading || store.updating || !store.students.length"
                @change="handleStudentChange"
              >
                <option value="">Todos los alumnos</option>
                <option v-for="student in store.students" :key="student.id" :value="student.id">
                  {{ student.label }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol xs="12" class="d-flex justify-content-end">
              <CButton
                color="primary"
                class="px-4"
                :disabled="!store.canUpdate"
                @click="$emit('update-predictions')"
              >
                <i class="fas fa-sync-alt me-2"></i>
                Actualizar Predicciones
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { useAcademicRiskStore } from '@/stores/academicRisk'

defineEmits(['update-predictions'])

const store = useAcademicRiskStore()

const handleSchoolYearChange = (event) => {
  store.onSchoolYearChange(Number(event.target.value))
}

const handleBimesterChange = (event) => {
  store.onBimesterChange(Number(event.target.value))
}

const handleGradeSectionChange = (event) => {
  store.onGradeSectionChange(Number(event.target.value))
}

const handleStudentChange = (event) => {
  const value = event.target.value
  store.onStudentChange(value ? Number(value) : null)
}
</script>

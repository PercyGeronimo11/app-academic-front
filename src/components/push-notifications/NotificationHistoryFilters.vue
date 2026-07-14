<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardHeader class="bg-white border-bottom py-3">
          <h5 class="fw-bold text-primary mb-0">
            <i class="fas fa-filter me-2 text-primary"></i>
            Filtros de notificaciones
          </h5>
        </CCardHeader>
        <CCardBody class="py-3 px-4">
          <CRow class="g-3 align-items-end">
            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Año escolar</CFormLabel>
              <CFormSelect
                :model-value="store.filters.schoolYear"
                :disabled="store.loading"
                @change="handleSchoolYearChange"
              >
                <option v-for="year in store.schoolYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol v-if="store.canFilterByGradeSection" xs="12" md="6" lg="3">
              <CFormLabel>Aula</CFormLabel>
              <CFormSelect
                :model-value="store.filters.gradeSectionId"
                :disabled="store.loading || !store.gradeSections.length"
                @change="handleGradeSectionChange"
              >
                <option v-for="item in store.gradeSections" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol v-if="store.canFilterByGradeSection" xs="12" md="6" lg="3">
              <CFormLabel>Alumno (opcional)</CFormLabel>
              <CFormSelect
                :model-value="store.filters.studentId || ''"
                :disabled="store.loading || !store.students.length"
                @change="handleStudentChange"
              >
                <option value="">Todos los alumnos</option>
                <option v-for="student in store.students" :key="student.id" :value="student.id">
                  {{ student.label }}
                </option>
              </CFormSelect>
            </CCol>

            <CCol xs="12" md="6" lg="3">
              <CFormLabel>Estado</CFormLabel>
              <CFormSelect
                :model-value="store.filters.status"
                :disabled="store.loading"
                @change="handleStatusChange"
              >
                <option value="">Todos</option>
                <option value="sent">Enviadas</option>
                <option value="failed">Fallidas</option>
              </CFormSelect>
            </CCol>

            <CCol v-if="store.scope.isStudentView" xs="12">
              <p class="text-body-secondary mb-0 small">
                Visualizando las notificaciones enviadas a su cuenta de estudiante.
              </p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { usePushNotificationsStore } from '@/stores/pushNotifications'

const store = usePushNotificationsStore()

const handleSchoolYearChange = (event) => {
  store.setSchoolYear(event.target.value)
}

const handleGradeSectionChange = (event) => {
  store.setGradeSection(Number(event.target.value))
}

const handleStudentChange = (event) => {
  const value = event.target.value
  store.setStudent(value ? Number(value) : null)
}

const handleStatusChange = async (event) => {
  store.filters.status = event.target.value
  await store.loadHistory()
}
</script>

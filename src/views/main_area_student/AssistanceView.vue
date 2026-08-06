<template>
  <div>
    <CRow class="mb-3">
      <CCol>
        <h2 class="mb-3">Asistencias del Estudiante</h2>
      </CCol>
    </CRow>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Fecha
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Estado
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <template v-if="!assistances.length">
          <CTableRow>
            <CTableDataCell colspan="2" class="list-empty-message py-4">
              No hay registros para mostrar.
            </CTableDataCell>
          </CTableRow>
        </template>
        <template v-else>
          <CTableRow v-for="assistance in assistances" :key="assistance.date_assistance">
            <CTableDataCell>
              <div class="text-center">{{ assistance.date_assistance }}</div>
            </CTableDataCell>
            <CTableDataCell class="text-center">
              <CBadge :class="colorEstado(assistance.status)" class="assist-badge-sm">
                {{ textoEstado(assistance.status) }}
              </CBadge>
            </CTableDataCell>
          </CTableRow>
        </template>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '../../services/AssistanceService'
import { useRoute } from 'vue-router'
import { textoEstado, colorEstado } from '@/utils/utils'
import { CBadge } from '@coreui/vue'

const route = useRoute()
const assistances = ref([])
const course_class_id = Number(route.params.courseClass)

const fetchAssistancesByStudent = async () => {
  try {
    const response = await AssistanceService.listAssistanceFromStudent(course_class_id)
    if (response?.data?.data) {
      assistances.value = response.data.data
    } else {
      console.error('Unexpected response structure:', response)
    }
  } catch (error) {
    console.error('Error fetching assistances:', error)
  }
}

onMounted(fetchAssistancesByStudent)
</script>

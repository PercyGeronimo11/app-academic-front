<template>
  <div class="report-container">
    <CButton color="secondary" @click="goBack" class="back-button">
      ← Regresar
    </CButton>
    <h1 class="report-title">Reporte de Asistencia</h1>

    <div v-if="assistenceData.length > 0">
      <div class="table-wrapper">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th class="text-center">Asistió</th>
              <th class="text-center">Faltó</th>
              <th class="text-center">Tardanza</th>
              <th class="text-center">Falta Justificada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in assistenceData" :key="index">
              <td>{{ student.student_name }}</td>
              <td class="text-center">{{ student.assistances.asistio }}</td>
              <td class="text-center">{{ student.assistances.falto }}</td>
              <td class="text-center">{{ student.assistances.tardanza }}</td>
              <td class="text-center">{{ student.assistances.falta_justificada }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="loading-container">
      <p class="loading-text">Cargando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AssistanceService from "@/services/AssistanceService"

const route = useRoute()
const router = useRouter()

const course_class_id = ref(Number(route.params.course_class_id) || 0)
const assistenceData = ref([])

const fetchData = async () => {
  if (course_class_id.value) {
    try {
      const response = await AssistanceService.getReport(course_class_id.value)

      if (response.data.success) {
        assistenceData.value = Object.values(response.data.data)
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error)
    }
  }
}

const goBack = () => {
  router.back()
}

onMounted(fetchData)
</script>

<style scoped>
/* General Container Styles */
.report-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Title Styles */
.report-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
}

/* Back Button Styles */
.back-button {
  display: inline-block;
  background-color: #007BFF;
  color: white;
  font-size: 1rem;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Table Wrapper Styles */
.table-wrapper {
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

/* Table Styles */
.attendance-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
}

.attendance-table th, .attendance-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd; /* Línea entre columnas */
}

.attendance-table th {
  background-color: #007BFF;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  border-right: 1px solid white; /* Línea blanca entre encabezados */
}

.attendance-table th:last-child,
.attendance-table td:last-child {
  border-right: none; /* Evita líneas en la última columna */
}

.attendance-table td {
  background-color: #fafafa;
  color: #333;
}

.attendance-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.attendance-table tr:hover {
  background-color: #eaf4ff;
}

/* Loading Styles */
.loading-container {
  text-align: center;
  margin-top: 50px;
}

.loading-text {
  font-size: 1.2rem;
  color: #666;
}

/* Responsive Styles */
@media screen and (max-width: 768px) {
  .report-title {
    font-size: 1.8rem;
  }

  .attendance-table th, .attendance-table td {
    padding: 10px;
    font-size: 0.9rem;
  }

  .report-container {
    padding: 15px;
  }

  .back-button {
    font-size: 0.9rem;
    padding: 8px 15px;
  }
}
</style>

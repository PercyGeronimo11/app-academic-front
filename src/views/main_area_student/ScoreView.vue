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
              N°
            </CTableHeaderCell>
            <CTableHeaderCell class="bg-body-secondary text-center">
              Tarea
            </CTableHeaderCell>
            <CTableHeaderCell class="bg-body-secondary text-center">
              Calificación
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="(score, index) in scores" :key="score.task_id">
            <CTableDataCell>
              <div class="text-center">{{ index+1 }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ score.title }}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div class="text-center">{{ score.score }}</div>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>
    <div class="div-pdf" >
        <CButton color="primary" @click="ReturnBack" class="pdf-button">
            ← Regresar
        </CButton>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import StudentService from "../../services/StudentService";
  import { useRoute} from "vue-router";
import router from "../../router";
  
  const route = useRoute();
  const scores = ref([]);
  const course_class_id = Number(route.params.courseClass);
  
  const fetchScoresByStudent = async () => {
    try {
      const response = await StudentService.getScoresByStudentAndClass(course_class_id);
      if (response && response.data && response.data.data) {
        console.log(response.data.data);
        
        scores.value = response.data.data;
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
  };

  const ReturnBack = () =>{
    router.back();
  }
  
  onMounted(fetchScoresByStudent);
  
  </script>
  
  <style>
  .status-success, .status-danger, .status-muted {
    display: inline-block;
    padding: 0.5em 1em;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: bold;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .status-success {
    color: aliceblue;
    background-color: #28a745; /* Verde */
  }
  
  .status-danger {
    color: white;
    background-color: #dc3545; /* Rojo */
  }
  
  .status-muted {
    color: white;
    background-color: #6c757d; /* Gris */
  }

  .div-pdf{
    margin: 15px 0px;
  }
  </style>
  
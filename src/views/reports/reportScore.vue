<template>
  <div class="grades-container">
    <CButton color="secondary" @click="goBack" class="back-button"> ← Regresar </CButton>
    <h2>Calificaciones de Estudiantes</h2>

    <!-- Mostrar la información del curso -->
    <div v-if="dataCourse" class="info-wrapper">
      <div class="info-container">
        <div class="info-box">
          <p>
            Curso: <b>{{ dataCourse.course_name }}</b>
          </p>
          <span></span>
        </div>
        <div class="info-box">
          <p>
            Grado: <b>{{ dataCourse.grade }}</b>
          </p>
          <span></span>
        </div>
        <div class="info-box">
          <p>
            Sección: <b>{{ dataCourse.section }}</b>
          </p>
          <span></span>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table v-if="students.length > 0" class="grades-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th v-for="index in maxTasks" :key="index">T{{ index }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.student_id">
            <td>{{ student.student_name }}</td>
            <td>{{ student.student_surname }}</td>
            <td v-for="index in maxTasks" :key="index">
              {{ student.scores[index - 1]?.score || "---" }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data-text">No hay datos de estudiantes disponibles.</p>
    </div>
    <CButton color="secondary" @click="generatePDF" class="back-button">
      Generar PDF
    </CButton>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import TaskService from "@/services/TaskService";
import CourseClassService from "@/services/CourseClassService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TimePostService from "../../services/TimePostService";

const route = useRoute();
const router = useRouter();

const course_class_id = ref(Number(route.params.course_class_id) || 0);
const unit_id = ref(Number(route.params.unit_id) || 0);

const students = ref([]);
const dataCourse = ref(null);

// Calcular el número máximo de tareas
const maxTasks = computed(() => {
  return students.value.length > 0
    ? Math.max(...students.value.map((student) => student.scores.length))
    : 0;
});

// Obtener información del curso
const getDataCourse = async () => {
  try {
    const response = await CourseClassService.getDataCourse(course_class_id.value);
    dataCourse.value = response.data.data; // Guardar los datos del curso en la variable reactiva
  } catch (error) {
    console.error("Error al cargar los datos del curso:", error);
  }
};

// Función para obtener datos de la API
const fetchData = async () => {
  if (course_class_id.value && unit_id.value) {
    try {
      const dataInput = {
        course_class_id: course_class_id.value,
        unit_id: unit_id.value,
      };
      const response = await TaskService.scoresGetByUnit(dataInput);

      if (response.data.success) {
        students.value = response.data.data;

        // Reporte de post time
        const data = {
          time_report_start: localStorage.getItem("tiempoLogin"), 
          time_report_end: Date.now(), 
        };

        try {
          const response = await TimePostService.storeTimePost(data);
          console.log("Tiempo registrado correctamente:", response.data.data);
        } catch (error) {
          console.error("Error al registrar el tiempo:", error);
        }
        // -----fin de post test -----
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  } else {
    console.warn("Parámetros course_class_id o unit_id no están definidos.");
  }
};

const goBack = () => {
  router.back();
};

function generatePDF() {
  const inicioPdf = Date.now();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("helvetica", "normal");

  // Student Data (Organized as requested)
  const studentData = [
    [
      { content: "Nombre", styles: { fontStyle: "bold" } },
      { content: "Apellido", styles: { fontStyle: "bold" } },
      { content: "T1", styles: { fontStyle: "bold" } },
      { content: "T2", styles: { fontStyle: "bold" } },
      { content: "T3", styles: { fontStyle: "bold" } },
    ],
  ];

  students.value.forEach((student) => {
    studentData.push([
      { content: student.student_name },
      { content: student.student_surname },
      ...student.scores.map((score) => score.score || "---"), // Map scores to '---' if empty
    ]);
  });

  // Set the title
  doc.setFontSize(16);
  doc.setFont("bold");
  doc.text("Reportes de Notas", 10, 10); // Adjust position if needed

  // Generate the Student Information Table
  autoTable(doc, {
    body: studentData,
    startY: 20, // Start the table below the title
    theme: "grid",
    styles: { font: "helvetica", fontStyle: "normal", fontSize: 10 },
  });

  doc.save("students.pdf");
}

// Ejecutar funciones al montar el componente
onMounted(() => {
  fetchData();
  getDataCourse();
});
</script>

<style scoped>
/* Contenedor Principal */
.grades-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Título */
h2 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: bold;
}

/* Botón de Regreso */
.back-button {
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.back-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.info-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0px;
}

.info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  border-radius: 15px;
  max-width: 800px;
  width: 100%;
}

/* Estilo de cada caja dentro de la información */
.info-box {
  flex: 1;
  min-width: 150px;
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-box p {
  margin: 0;
  font-size: 1rem;
  color: #555;
}

.info-box span {
  display: block;
  margin-top: 5px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
}

/* Tabla de Calificaciones */
.table-container {
  overflow-x: auto;
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 1rem;
  text-align: left;
  border-radius: 10px;
  overflow: hidden;
}

.grades-table th,
.grades-table td {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd; /* Separación entre columnas */
}

.grades-table th:last-child,
.grades-table td:last-child {
  border-right: none;
}

.grades-table th {
  background-color: #007bff;
  color: white;
  text-transform: uppercase;
  font-weight: bold;
}

.grades-table td {
  background-color: #f9f9f9;
}

.grades-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.grades-table tr:hover {
  background-color: #eaf4ff;
}

/* Mensaje sin datos */
.no-data-text {
  text-align: center;
  color: #999;
  font-size: 1.2rem;
}

/* Responsividad */
@media screen and (max-width: 768px) {
  h2 {
    font-size: 1.5rem;
  }

  .grades-table th,
  .grades-table td {
    padding: 10px;
    font-size: 0.9rem;
  }

  .back-button {
    font-size: 0.9rem;
    padding: 8px 15px;
  }

  .info-container {
    padding: 15px;
  }

  .info-box {
    min-width: 100%;
  }
}
</style>

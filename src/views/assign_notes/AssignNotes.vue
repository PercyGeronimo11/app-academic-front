<template>
  <div class="alumno-list">
    <h3 class="text-center">Calificaciones de tareas</h3>
    <br />
      
    <CTable class="alumno-table">
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Alumno
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Nota
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(alumno, index) in items" :key="index">
          <CTableDataCell>
            <div class="text-center">{{ alumno.nombre }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <select v-model="alumno.value" @change="updateScore(alumno.id, alumno.value)">
              <option value="AD">AD</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
    <div class="div-button-back">
      <CButton color="secondary" @click="goBack" class="back-button"> ← Regresar </CButton>
    </div>
    
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import StudentService from "@/services/StudentService";
import TaskService from "@/services/TaskService";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const course_id = route.params.course_id;
const task_id = route.params.id;
  const router = useRouter();

const items = ref([]);

const listItem = ref([]);

onMounted(async () => {
  try {
    await listItems();
  } catch (error) {
    console.error(error);
  }
});

const listItems = async () => {
  const data = {
    id: task_id,
  };
  const response = await StudentService.getitemsByCourse(data);
  listItem.value = response.data.data;
  console.log(listItem.value.name);

  listItem.value.forEach((item) => {
    items.value.push({
      id: item.student_id,
      nombre: item.names,
      value: item.score != null && item.score != "" ? item.score : "",
    });
  });
};

const updateScore = async (student_id, nota) => {
  try {
    const data = {
      task_id: parseInt(task_id),
      student_id: student_id,
      score: nota,
    };
    await TaskService.scoreTaskStudent(data);
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Guardado exitosamente",
    });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: error.response.data.message[0],
      });
    } else {
      console.log("error:" + error);
    }
  }
};

  const goBack = () => {
    router.back();
  };

</script>

<style>
.alumno-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.alumno-table {
  width: 50%;
  border-collapse: collapse;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; /* Fuente elegante */
}

.alumno-table th,
.alumno-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.alumno-table th:first-child,
.alumno-table td:first-child {
  text-align: left;
}

.alumno-table th:last-child,
.alumno-table td:last-child {
  text-align: center;
}

/* Select con estilo */
.alumno-table td select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%; /* Ancho responsive */
  background-image: url("data:image/svg+xml;utf8,<svg fill='%23ccc' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

/* Mostrar el select con estilo */
.alumno-table td select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Mostrar el select con estilo */
.alumno-table td select option {
  background-color: #fff;
}

/* Estilos para la columna de Nota */
.alumno-table td:last-child {
  /* Selecciona la última columna (Nota) */
  text-align: center;
  width: 150px; /* Ancho fijo para la columna de Nota */
}

/* Estilos para el select dentro de la columna de Nota */
.alumno-table td:last-child select {
  border: 1px solid #ddd; /* Borde sutil */
}

/* Responsive: Ajustes para pantallas más pequeñas */
@media (max-width: 768px) {
  .alumno-table th,
  .alumno-table td {
    font-size: 14px; /* Tamaño de fuente más pequeño */
  }
}

@media (max-width: 480px) {
  .alumno-table th,
  .alumno-table td {
    padding: 8px 12px; /* Menos padding */
  }
  .alumno-table th {
    font-size: 12px;
  }
  .alumno-table td:last-child {
    /* Ajusta el ancho de la columna en pantallas pequeñas */
    width: 120px;
  }
}

.div-button-back{
  margin-left: 10%;
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
</style>

<template>
  <div>

    <div class="select-container">
      <label for="student-select">Selecciona la sección:</label>
      <div class="select-wrapper">
        <VueSelect
          v-model="selectedGrade"
          :options="optionsGrades"
          placeholder="Selecciona una opción"
        />
      </div>
    </div>

    <div class="select-container">
      <label for="student-select">Selecciona un alumno:</label>
      <div class="select-wrapper">
        <VueSelect
          v-model="selectedStudent"
          :options="options"
          placeholder="Selecciona una opción"
        />
        <button @click="addStudent" class="add-button">Agregar</button>
      </div>
    </div>

    <div class="selected-box">
      <div v-if="selectedStudents.length > 0">
        <table class="students-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in selectedStudents" :key="index">
              <td>{{ student.dni }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.surname_father }}</td>
              <td>{{ student.surname_mother }}</td>
              <td>
                <span class="close-icon" @click="removeStudent(index)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.59 8L14 10.41L10.41 14L8 11.59L5.59 14L2 10.41L4.41 8L2 5.59L5.59 2L8 4.41L10.41 2L14 5.59L11.59 8Z" fill="red"/>
                  </svg>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-message">No hay elementos seleccionados.</p>
    </div>

    <div class="select-container">
      <button @click="submit" class="submit" @change="submit">Guardar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StudentService from '@/services/StudentService';
import GradeService from '@/services/GradeService';
import VueSelect from "vue3-select-component";

const selectedStudent = ref(null);   // Cambiado a null para manejar una selección más clara
const selectedStudents = ref([]);     // Para almacenar estudiantes seleccionados
const selectedStudentsIds = ref([]); 
const options = ref([]);  
const students = ref([]);            // Opciones del select
const grades = ref([]);
const optionsGrades = ref([]);  
const selectedGrade = ref(null);   

onMounted(async () => {
  try {
    await listGrades();
    await loadStudents();
  } catch (error) {
    console.error(error);
  }
});

// Agregar estudiante seleccionado a la lista
const addStudent = () => {
  if (selectedStudent.value) {
    // Buscar el estudiante en la lista de estudiantes    
    const studentToAdd = students.value.find(student => student.id === selectedStudent.value);

    // Solo agregar si el estudiante no está ya en la lista
    if (studentToAdd && !selectedStudents.value.some(student => student.id === studentToAdd.id)) {
      selectedStudents.value.push(studentToAdd); // Agregar el objeto completo del estudiante
      selectedStudentsIds.value.push({student_id:studentToAdd.id});
    }
  }
  selectedStudent.value = null; // Limpiar la selección después de agregar
};

// Eliminar estudiante de la lista
const removeStudent = (index) => {
  selectedStudents.value.splice(index, 1);
};

const listGrades = async () => {
  const response = await GradeService.getItems();
  grades.value = response.data.data;

  // Crear opciones para el select
  optionsGrades.value = grades.value.map(grade => ({
    label: `${grade.name} - ${grade.section}`, // Concatenar nombre y apellido
    value: grade.id,                                    // ID como value
  }));
}
// Cargar estudiantes desde el servicio
const loadStudents = async () => {
  const response = await StudentService.getItems();
  students.value = response.data.data;
  

  // Crear opciones para el select
  options.value = students.value.map(student => ({
    label: `${student.dni} - ${student.name} ${student.surname_father} ${student.surname_mother}`, // Concatenar nombre y apellido
    value: student.id,                                    // ID como value
  }));
};

const submit = async () => {
  var data = {
    "grade_id": selectedGrade.value, // ID del grado
    "period_id": 1, // ID del periodo
    "students": selectedStudentsIds.value
  }
  const response = await StudentService.assingStudent(data);

  console.log(response);
  
}
</script>

<style scoped>
/* Estilo del select personalizado */
.select-container {
  margin-bottom: 20px;
}

.select-wrapper {
  display: flex;  /* Usar flex para alinear el select y el botón */
  align-items: center; /* Alinear verticalmente */
}

.add-button {
  margin-left: 10px; /* Espacio entre el select y el botón */
  padding: 8px 12px; /* Tamaño del botón */
  font-size: 16px; /* Tamaño del texto */
  border: none; /* Sin borde */
  border-radius: 5px; /* Bordes redondeados */
  background-color: #007BFF; /* Color de fondo */
  color: white; /* Color del texto */
  cursor: pointer; /* Cursor tipo puntero */
  transition: background-color 0.3s; /* Efecto de transición */
}

.add-button:hover {
  background-color: #0056b3; /* Color de fondo al pasar el ratón */
}

.submit {
  margin-top: 20px;
  margin-left: 10px; /* Espacio entre el select y el botón */
  padding: 8px 12px; /* Tamaño del botón */
  font-size: 16px; /* Tamaño del texto */
  border: none; /* Sin borde */
  border-radius: 5px; /* Bordes redondeados */
  background-color: #00be20; /* Color de fondo */
  color: white; /* Color del texto */
  cursor: pointer; /* Cursor tipo puntero */
  transition: background-color 0.3s; /* Efecto de transición */
}

.submit:hover {
  background-color: #00862f; /* Color de fondo al pasar el ratón */
}

.selected-box {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.students-table th, .students-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.students-table th {
  background-color: #f2f2f2;
}

.close-icon {
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

.close-icon:hover {
  transform: scale(1.1);
}

.empty-message {
  text-align: center;
  color: #ccc;
  font-style: italic;
}
</style>

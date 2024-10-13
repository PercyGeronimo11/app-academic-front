<template>
  <div>

    <div class="select-row">
      <div class="select-container">
        <label for="grades">Selecciona el grado:</label>
        <div class="select-wrapper" id="grades">
          <VueSelect
            v-model="selectedGrade"
            :options="optionsGrades"
            placeholder="Selecciona una opción"
          />
        </div>
      </div>

      <div class="select-container">
        <label for="sections">Selecciona la sección:</label>
        <div class="select-wrapper" id="sections">
          <VueSelect
            v-model="selectedSection"
            :options="optionsSections"
            placeholder="Selecciona una opción"
          />
        </div>
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

    <!-- Tabla de alumnos seleccionados -->
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
              <td data-label="DNI">{{ student.dni }}</td>
              <td data-label="Nombre">{{ student.name }}</td>
              <td data-label="Apellido Paterno">{{ student.surname_father }}</td>
              <td data-label="Apellido Materno">{{ student.surname_mother }}</td>
              <td data-label="Acciones">
                <span class="close-icon" @click="removeStudent(index)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.59 8L14 10.41L10.41 14L8 11.59L5.59 14L2 10.41L4.41 8L2 5.59L5.59 2L8 4.41L10.41 2L14 5.59L11.59 8Z"
                      fill="red"
                    />
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
import GradeSectionService from '@/services/GradeSectionService';
import VueSelect from "vue3-select-component";
import Swal from 'sweetalert2'

const selectedStudent = ref(null);   // Cambiado a null para manejar una selección más clara
const selectedStudents = ref([]);     // Para almacenar estudiantes seleccionados
const selectedStudentsIds = ref([]); 
const options = ref([]);  
const students = ref([]);            // Opciones del select
const grades = ref([]);
const sections = ref([]);
const optionsGrades = ref([]);  
const optionsSections = ref([]);  
const selectedGrade = ref(null);   
const selectedSection = ref(null); 

onMounted(async () => {
  try {
    await listSections();
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
  const response = await GradeSectionService.getGrades();
  grades.value = response.data.data;

  // Crear opciones para el select
  optionsGrades.value = grades.value.map(grade => ({
    label: grade.name, // Concatenar nombre y apellido
    value: grade.id,                                    // ID como value
  }));
}

const listSections = async () => {
  const response = await GradeSectionService.getSections();
  sections.value = response.data.data;

  // Crear opciones para el select
  optionsSections.value = sections.value.map(section => ({
    label: section.name, // Concatenar nombre y apellido
    value: section.id,                                    // ID como value
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

const clearData =() => {
  selectedGrade.value=0;
  selectedSection.value=0;
  selectedStudentsIds.value=null;
}

const submit = async () => {
  var data = {
    "grade_id": selectedGrade.value, // ID del grado
    "section_id": selectedSection.value,
    "period_id": 1, // ID del periodo
    "students": selectedStudentsIds.value
  }

  try {
    await StudentService.assingStudent(data);
    clearData();
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Administrativo registrado con éxito.',
    });
  } catch (error){
    if (error.response && error.response.data && error.response.data.message) {
      Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: error.response.data.message,
      });
    } else {
      console.log("error:" + error);
    }
  }
  console.log(response);
  
}
</script>

<style scoped>
/* Layout general */
.select-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.select-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.select-wrapper {
  margin-top: 5px;
  display: flex;
  align-items: center;
}

/* Botones */
.add-button,
.submit {
  margin-left: 10px;
  padding: 8px 12px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button {
  background-color: #007bff;
}

.add-button:hover {
  background-color: #0056b3;
}

.submit {
  margin-top: 20px;
  background-color: #00be20;
}

.submit:hover {
  background-color: #00862f;
}

/* Caja de elementos seleccionados */
.selected-box {
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.empty-message {
  text-align: center;
  color: #ccc;
  font-style: italic;
}

/* Tabla */
.students-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.students-table th,
.students-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.students-table thead {
  background-color: #f2f2f2;
}

@media (max-width: 768px) {
  .students-table {
    border: 0;
  }

  .students-table thead {
    display: none;
  }

  .students-table tr {
    display: block;
    margin-bottom: 10px;
    border-bottom: 1px solid #ddd;
  }

  .students-table td {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border: 0;
    border-bottom: 1px solid #ddd;
  }

  .students-table td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 10px;
  }

  .students-table td:last-child {
    border-bottom: 0;
  }
}

/* Icono de cerrar */
.close-icon {
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

.close-icon:hover {
  transform: scale(1.1);
}
</style>

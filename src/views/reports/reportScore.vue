<template>
  <div>
    <CButton color="secondary" @click="goBack" class="mb-3">
      ← Regresar
    </CButton>
    <h2>Calificaciones de Estudiantes</h2>

    <!-- Mostrar los valores de `course_class_id` y `unit_id` solo si están definidos -->
    <p v-if="course_class_id && unit_id">Course Class ID: {{ course_class_id }}</p>
    <p v-if="course_class_id && unit_id">Unit ID: {{ unit_id }}</p>

    <table v-if="students.length > 0">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th v-for="index in maxTasks" :key="index">
            T{{ index }}
          </th>
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
    <p v-else>No hay datos de estudiantes disponibles.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TaskService from "@/services/TaskService"

// Obtener acceso al enrutador y a los parámetros de la ruta
const route = useRoute()
const router = useRouter()

// Obtener `course_class_id` y `unit_id` de los parámetros de la ruta, con un valor predeterminado en caso de que falten
const course_class_id = ref(Number(route.params.course_class_id) || 0)
const unit_id = ref(Number(route.params.unit_id) || 0)

// Verificar que los valores sean correctos en la consola
console.log('Course Class ID:', course_class_id.value)
console.log('Unit ID:', unit_id.value)

const students = ref([])

// Calcular el número máximo de tareas
const maxTasks = computed(() => {
  return students.value.length > 0
    ? Math.max(...students.value.map(student => student.scores.length))
    : 0
})

// Función para obtener datos de la API
const fetchData = async () => {
  if (course_class_id.value && unit_id.value) { // Asegúrate de que los valores estén definidos antes de hacer la solicitud
    try {
      const dataInput = {
        course_class_id: course_class_id.value,
        unit_id: unit_id.value,
      }
      const response = await TaskService.scoresGetByUnit(dataInput)

      if (response.data.success) {
        students.value = response.data.data
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error)
    }
  } else {
    console.warn("Parámetros course_class_id o unit_id no están definidos.")
  }
}

// Función para regresar a la página anterior
const goBack = () => {
  router.back()
}

// Llamar a `fetchData` cuando el componente se monte
onMounted(fetchData)
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 1rem;
}
</style>

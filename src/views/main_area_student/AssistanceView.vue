<template>
  <div>
    <h2>Asistencias del Estudiante</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Hora Inicio</th>
          <th>Hora Fin</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="assistance in assistances" :key="assistance.id">
          <td>{{ assistance.date_assistance }}</td>
          <td>{{ assistance.horary_data.hour_start }}</td>
          <td>{{ assistance.horary_data.hour_end }}</td>
          <td>
            <span :class="getStatusClass(assistance.status)">
              {{ assistance.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setupGT>
import { ref, onMounted } from "vue";
import AssistanceService from "@/services/AssistanceService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const assistances = ref([]);
const course_class_id = Number(route.params.courseClass);

const fetchAssistances = async () => {
  try {
    const response = await AssistanceService.listAssistanceFromStudent(course_class_id);
    assistances.value = response.data.data;
  } catch (error) {
    console.error("Error fetching assistances:", error);
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "PRESENTE":
      return "text-success";
    case "AUSENTE":
      return "text-danger";
    default:
      return "text-muted";
  }
};

onMounted(fetchAssistances);
</script>

<style>
.text-success {
  color: green;
}
.text-danger {
  color: red;
}
.text-muted {
  color: gray;
}
</style>

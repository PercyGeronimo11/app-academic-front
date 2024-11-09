<template>
  <div>
    <h2>Registro de Asistencias</h2>
    <div v-for="asistencia in asistencias" :key="asistencia.id">
      <p>Fecha: {{ asistencia.created_at }}</p>
      <p>Estudiante: {{ asistencia.student.nombre }}</p>
      <select v-model="asistencia.estado" @change="updateAsistencia(asistencia)">
        <option value="asistio">Asistió</option>
        <option value="falto">Faltó</option>
        <option value="tardanza">Tardanza</option>
        <option value="falta justificada">Falta Justificada</option>
      </select>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const asistencias = reactive([]);

    const fetchAsistencias = async () => {
      try {
        const response = await axios.get("/api/assistances"); // Ajusta la URL según tu API
        asistencias.push(...response.data);
      } catch (error) {
        console.error("Error al obtener asistencias:", error);
      }
    };

    const updateAsistencia = async (asistencia) => {
      try {
        await axios.put(`/api/assistances/${asistencia.id}`, {
          estado: asistencia.estado,
        });
        alert("Asistencia actualizada");
      } catch (error) {
        console.error("Error al actualizar asistencia:", error);
      }
    };

    onMounted(fetchAsistencias);

    return {
      asistencias,
      updateAsistencia,
    };
  },
};
</script>

<template>
  <div class="dashboard">

    <h2 class="title">Resumen de Hoy</h2>

    <div class="cards">

      <!-- Total alumnos -->
      <div class="card total">
        <h3>Total Alumnos</h3>
        <p class="number">{{ data.total }}</p>
        <span class="percent">
          {{ porcentaje(data.total) }}%
        </span>
      </div>

      <!-- Asistencias -->
      <div class="card success">
        <h3>Asistencias</h3>
        <p class="number">
          {{ data.presentes }}
        </p>
        <span class="percent">
          {{ porcentaje(data.presentes) }}%
        </span>
      </div>

      <!-- Tardanzas -->
      <div class="card warning">
        <h3>Tardanzas</h3>
        <p class="number">
          {{ data.tardanzas }}
        </p>
        <span class="percent">
          {{ porcentaje(data.tardanzas) }}%
        </span>
      </div>

      <!-- Faltas -->
      <div class="card danger">
        <h3>Faltas</h3>
        <p class="number">
          {{ data.faltas }}
        </p>
        <span class="percent">
          {{ porcentaje(data.faltas) }}%
        </span>
      </div>

    </div>

  </div>


  <h2 class="title">Asistencias por Sección - Tiempo real</h2>

  <div class="table-container">
    <table class="custom-table">
      <thead>
        <tr>
          <th>Sección</th>
          <th>Total</th>
          <th>Asistencias</th>
          <th>Tardanzas</th>
          <th>Faltas</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in secciones" :key="item.id">
          <td class="section-name">
            {{ item.grado }}° {{ item.seccion }}
          </td>

          <td class="success">
            {{ item.total }}
          </td>

          <td class="success">
            {{ item.asistencias }}
          </td>

          <td class="warning">
            {{ item.tardanzas }}
          </td>

          <td class="danger">
            {{ item.faltas }}
          </td>
        </tr>
      </tbody>

    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'


const data = ref({
  total: 0,
  presentes: 0,
  tardanzas: 0,
  faltas: 0
})

const obtenerResumen = async () => {
  const res = await AssistanceService.getResumenDiario()
  data.value = res.data
}

const porcentaje = (valor) => {
  if (!data.value.total) return 0
  return ((valor / data.value.total) * 100).toFixed(1)
}


// ----------------------------------------
const secciones = ref([])

const generarDatosSimulados = () => {
  AssistanceService.getAsistenciaBySeccion().then(res => {
    secciones.value = res.data
  })
}


// const generarDatosSimulados = () => {
//   const grados = [1, 2, 3, 4, 5]
//   const letras = ['A', 'B', 'C', 'D']

//   let id = 1
//   const datos = []

//   grados.forEach(grado => {
//     letras.forEach(letra => {
//       const total = 32

//       const asistencias = Math.floor(Math.random() * 30) + 1
//       const tardanzas = Math.floor(Math.random() * 5)
//       const faltas = total - asistencias

//       datos.push({
//         id: id++,
//         grado,
//         seccion: letra,
//         total,
//         asistencias,
//         tardanzas,
//         faltas
//       })
//     })
//   })

//   secciones.value = datos
// }

onMounted(() => {
  generarDatosSimulados()
  obtenerResumen()
  setInterval(obtenerResumen, 5000)
  setInterval(generarDatosSimulados, 5000)
})

</script>
<style scoped>
.dashboard {
  padding: 20px;
}

.title {
  margin-bottom: 25px;
  font-weight: 600;
  color: #2c3e50;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.card {
  padding: 20px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h3 {
  margin: 0;
  font-size: 16px;
  color: #6c757d;
}

.number {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0 5px;
}

.percent {
  font-size: 14px;
  font-weight: 500;
}

/* Colores */

.total {
  border-left: 6px solid #321fdb;
}

.success {
  border-left: 6px solid #2eb85c;
}

.warning {
  border-left: 6px solid #f9b115;
}

.danger {
  border-left: 6px solid #e55353;
}


.section-dashboard {
  padding: 20px;
}

.title {
  margin-bottom: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table thead {
  background: #321fdb;
  color: white;
}

.custom-table th,
.custom-table td {
  padding: 12px 15px;
  text-align: center;
}

.custom-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.custom-table tbody tr:hover {
  background: #f8f9fa;
}

.section-name {
  font-weight: 600;
}

.success {
  color: #2eb85c;
  font-weight: bold;
}

.warning {
  color: #f9b115;
  font-weight: bold;
}

.danger {
  color: #e55353;
  font-weight: bold;
}
</style>
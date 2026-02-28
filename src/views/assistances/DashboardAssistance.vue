<template>
  <div class="dashboard">
    <h2>Resumen de Hoy</h2>

    <div class="cards">

      <div class="card">
        <h3>Asistencias</h3>
        <p>{{ data.presentes }} / {{ data.total }}</p>
      </div>

      <div class="card tardanza">
        <h3>Tardanzas</h3>
        <p>{{ data.tardanzas }}</p>
      </div>

      <div class="card falta">
        <h3>Faltas</h3>
        <p>{{ data.faltas }}</p>
      </div>

    </div>
  </div>
   <Bar :data="chartData" :options="options" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'

import { Bar } from 'vue-chartjs'
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Asistencias',
      data: [],
    }
  ]
})

const options = {
  responsive: true
}

const cargarDatos = async () => {
  const res = await AssistanceService.getResumenSemanal()
  chartData.value.labels = res.data.map(i => i.dia)
  chartData.value.datasets[0].data = res.data.map(i => i.total)
}


const data = ref({
  total: 0,
  presentes: 0,
  tardanzas: 0,
  faltas: 0
})

const obtenerResumen = async () => {
  const res = await AssistanceService.getResumenDiario();
  data.value = res.data
}

onMounted(() => {
  cargarDatos()
  obtenerResumen()
  setInterval(obtenerResumen, 5000)
})

</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.cards {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.tardanza {
  background: #ffe0b2;
}

.falta {
  background: #ffcdd2;
}
</style>
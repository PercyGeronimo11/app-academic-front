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
    <div class="total-card">
      <h4>Total semanal</h4>
      <h2>{{ total }}</h2>
    </div>
  </div style="height: 400px;">
  <CChartBar :data="chartData" :options="options" :plugins="plugins" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AssistanceService from '@/services/AssistanceService'
import { CChartBar } from '@coreui/vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'

const valores = [10, 20, 15, 30, 30]
const total = valores.reduce((a, b) => a + b, 0)

const chartData = {
  labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  datasets: [
    {
      label: 'Asistencias',
      data: valores,
      backgroundColor: [
        '#321fdb',
        '#2eb85c',
        '#f9b115',
        '#e55353',
        '#3399ff'
      ],
      borderRadius: 2,
      barThickness: 40
    }
  ]
}


const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const value = context.raw
          const percentage = ((value / total) * 100).toFixed(1)
          return ` ${value} asistencias (${percentage}%)`
        }
      }
    },
    datalabels: {
      color: '#000',
      anchor: 'end',
      align: 'top',
      font: {
        weight: 'bold'
      },
      formatter: (value) => {
        const percentage = ((value / total) * 100).toFixed(1)
        return `${value}\n${percentage}%`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#e0e0e0'
      },
      ticks: {
        stepSize: 5
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
// const chartData = ref({
//   labels: [],
//   datasets: [
//     {
//       label: 'Asistencias',
//       data: [],
//       backgroundColor: '#321fdb'
//     }
//   ]
// })

// const options = {
//   responsive: true,
//   maintainAspectRatio: false
// }

// const cargarDatos = async () => {
//   const res = await AssistanceService.getResumenSemanal()
//   chartData.value.labels = res.data.map(i => i.dia)
//   chartData.value.datasets[0].data = res.data.map(i => i.total)
// }

// const cargarDatos = async () => {
//   const res = await AssistanceService.getResumenSemanal()
//   console.log("RESUMEN SEMANAL:", res.data)

//   chartData.value.labels = res.data.map(i => i.dia)
//   chartData.value.datasets[0].data = res.data.map(i => i.total)
// }

const cargarDatos = async () => {
  chartData.value.labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  chartData.value.datasets[0].data = [10, 20, 15, 30, 25]
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

const plugins = [ChartDataLabels]

onMounted(() => {
  //cargarDatos()
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
import { computed, ref } from 'vue'
import { colorFijoEstado, ESTADOS_ASISTENCIA } from '@/utils/utils'

const emptyChart = () => ({
  mode: 'bimester',
  title: 'Distribución por bimestre',
  labels: [],
  asistencias: [],
  tardanzas: [],
  faltas: [],
})

/**
 * Estado y datasets del gráfico adaptativo (bimestre / mes) del reporte QR.
 */
export function useAssistanceDashboardChart() {
  const chart = ref(emptyChart())

  const chartTitle = computed(() => chart.value.title || 'Distribución de asistencias')

  const chartData = computed(() => ({
    labels: chart.value.labels || [],
    datasets: [
      {
        label: 'Asistió',
        data: chart.value.asistencias || [],
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.ASISTENCIA),
        maxBarThickness: 48,
      },
      {
        label: 'Tardanzas',
        data: chart.value.tardanzas || [],
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.TARDANZA_MODERADA),
        maxBarThickness: 48,
      },
      {
        label: 'Faltó',
        data: chart.value.faltas || [],
        backgroundColor: colorFijoEstado(ESTADOS_ASISTENCIA.FALTA),
        maxBarThickness: 48,
      },
    ],
  }))

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        color: '#212529',
        font: { weight: 'bold', size: 11 },
        display(context) {
          const value = context.dataset.data[context.dataIndex]
          return Number(value) > 0
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      },
    },
  }

  const applyChartFromPayload = (payload) => {
    chart.value = {
      ...emptyChart(),
      ...(payload?.chart || {}),
    }
  }

  return {
    chart,
    chartTitle,
    chartData,
    chartOptions,
    applyChartFromPayload,
  }
}

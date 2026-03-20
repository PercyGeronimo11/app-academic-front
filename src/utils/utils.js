
export const  textoEstado = (estado) => {

    if (estado === 'A') return 'Asistió'
    if (estado === 'T') return 'Tardanza'
    if (estado === 'F') return 'Faltó'

    return 'Sin registro'
}

export const colorEstado = (estado) => {

    if (estado === 'A') return 'success'
    if (estado === 'T') return 'warning'
    if (estado === 'F') return 'danger'

    return 'secondary'
}



export const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)

  // Fecha: DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const fecha = `${day}/${month}/${year}`

  return fecha
}


export const formatTime = (dateStr) => {
  if (!dateStr) return '-'

  const date = new Date(dateStr)

  // Hora: HH:mm
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const hora = `${hours}:${minutes}`

  return hora
}




export const ESTADOS_ASISTENCIA = {
  ASISTENCIA: 'A',
  TARDANZA_LEVE: 'TL',
  TARDANZA_MODERADA: 'TM',
  TARDANZA_GRAVE: 'TG',
  TARDANZA_EXTREMA: 'TE',
  FALTA: 'F',
}

export const textoEstado = (estado) => {

  if (estado === ESTADOS_ASISTENCIA.ASISTENCIA) return 'Asistió'
  if (estado === ESTADOS_ASISTENCIA.TARDANZA_LEVE) return 'Tardanza Leve'
  if (estado === ESTADOS_ASISTENCIA.TARDANZA_MODERADA) return 'Tardanza Moderada'
  if (estado === ESTADOS_ASISTENCIA.TARDANZA_GRAVE) return 'Tardanza Grave'
  if (estado === ESTADOS_ASISTENCIA.TARDANZA_EXTREMA) return 'Tardanza Extrema'
  if (estado === ESTADOS_ASISTENCIA.FALTA) return 'Faltó'

  return 'Sin registro'
}

export const colorEstado = (type) => {
  const classes = {
    [ESTADOS_ASISTENCIA.ASISTENCIA]: 'bg-success text-white  px-3 py-1 fs-6',
    [ESTADOS_ASISTENCIA.TARDANZA_LEVE]: 'bg-orange-1 text-white  px-3 py-1 fs-6',
    [ESTADOS_ASISTENCIA.TARDANZA_MODERADA]: 'bg-orange-2 text-white  px-3 py-1 fs-6',
    [ESTADOS_ASISTENCIA.TARDANZA_GRAVE]: 'bg-orange-3 text-white  px-3 py-1 fs-6',
    [ESTADOS_ASISTENCIA.TARDANZA_EXTREMA]: 'bg-orange-4 text-white  px-3 py-1 fs-6',
    [ESTADOS_ASISTENCIA.FALTA]: 'bg-danger text-white  px-3 py-1 fs-6'
  }

  return classes[type] || 'bg-secondary text-white'
}


export const colorFijoEstado = (type) => {
  const colors = {
    [ESTADOS_ASISTENCIA.ASISTENCIA]: '#28a745',
    [ESTADOS_ASISTENCIA.TARDANZA_LEVE]: '#eed306',
    [ESTADOS_ASISTENCIA.TARDANZA_MODERADA]: '#ffb300',
    [ESTADOS_ASISTENCIA.TARDANZA_GRAVE]: '#fd841a',
    [ESTADOS_ASISTENCIA.TARDANZA_EXTREMA]: '#fa6736',
    [ESTADOS_ASISTENCIA.FALTA]: '#dc3545'
  }
  return colors[type] || '#6c757d'
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


export const gradoTexto = (grado) => {
  const grados = {
    1: 'Primero',
    2: 'Segundo',
    3: 'Tercero',
    4: 'Cuarto',
    5: 'Quinto'
  }
  return grados[grado] || grado
}


export const getFirstName = (fullName) => {
  if (!fullName) {
    return null;
  }

  // Limpiar espacios extras
  fullName = fullName.trim().replace(/\s+/g, ' ');

  // Separar por espacios
  const parts = fullName.split(' ');

  return parts[0] ?? null;
}





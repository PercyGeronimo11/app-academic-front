
export const  textoEstado = (estado) => {

    if (estado === 'A') return 'Asistió'
    if (estado === 'TL') return 'Tardanza Leve'
    if (estado === 'TM') return 'Tardanza Moderada'
    if (estado === 'TG') return 'Tardanza Grave'
    if (estado === 'TE') return 'Tardanza Extrema'
    if (estado === 'F') return 'Faltó'

    return 'Sin registro'
}

export const colorEstado = (estado) => {

    if (estado === 'A') return 'success'
    if (estado === 'TL') return 'bg-orange-1 text-white  px-3 py-1 fs-6'
    if (estado === 'TM') return 'bg-orange-2 text-white  px-3 py-1 fs-6'
    if (estado === 'TG') return 'bg-orange-3 text-white  px-3 py-1 fs-6'
    if (estado === 'TE') return 'bg-orange-4 text-white  px-3 py-1 fs-6'
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




export const getAttendanceClass = (type) => {
  const classes = {
    asistencia: 'bg-success text-white  px-3 py-1 fs-6',
    tard_leve: 'bg-orange-1 text-white  px-3 py-1 fs-6',
    tard_moderado: 'bg-orange-2 text-white  px-3 py-1 fs-6',
    tard_grave: 'bg-orange-3 text-white  px-3 py-1 fs-6',
    tard_extremo: 'bg-orange-4 text-white  px-3 py-1 fs-6',
    faltas: 'bg-danger text-white  px-3 py-1 fs-6'
  }

  return classes[type] || 'bg-secondary text-white'
}



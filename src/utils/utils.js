
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


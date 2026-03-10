
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



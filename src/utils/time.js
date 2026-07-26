export function getPeruTime() {
    const now = new Date();
    const peruTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
    const hours = peruTime.getHours().toString().padStart(2, "0");
    const minutes = peruTime.getMinutes().toString().padStart(2, "0");
    const seconds = peruTime.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

export function formatDatabaseDate(isoString) {
  const date = new Date(isoString);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** Normaliza a YYYY-MM-DD para API / inputs. Acepta ISO o DD/MM/YYYY. */
export const toIsoDate = (value) => {
  if (!value) return ''
  const s = String(value).trim()

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }

  const date = new Date(s)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Fecha visible siempre como DD/MM/YYYY (día primero). */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const s = String(dateStr).trim()

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [day, month, year] = s.split('/')
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  }

  // Solo fecha (evita desfase UTC de new Date('YYYY-MM-DD'))
  const dateOnly = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateOnly) {
    return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`
  }

  const date = new Date(s)
  if (Number.isNaN(date.getTime())) return '-'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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


export const fecha_actual = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})

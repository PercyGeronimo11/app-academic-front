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


export const fecha_actual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})

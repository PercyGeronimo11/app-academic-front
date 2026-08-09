/**
 * Imágenes locales por defecto para cursos del catálogo (CRUD).
 * Se usan solo cuando el curso no tiene image / course_image en el API.
 */

const DEFAULT_BY_SLUG = {
  matematica: '/course-defaults/matematica.jpg',
  comunicacion: '/course-defaults/comunicacion.jpg',
  ingles: '/course-defaults/ingles.jpg',
  'arte-y-cultura': '/course-defaults/arte-y-cultura.jpg',
  'ciencias-sociales': '/course-defaults/ciencias-sociales.jpg',
  'desarrollo-personal-ciudadania-y-civica': '/course-defaults/desarrollo-personal.jpg',
  'educacion-fisica': '/course-defaults/educacion-fisica.jpg',
  'educacion-religiosa': '/course-defaults/educacion-religiosa.jpg',
  'ciencia-y-tecnologia': '/course-defaults/ciencia-y-tecnologia.jpg',
  'educacion-para-el-trabajo': '/course-defaults/educacion-para-el-trabajo.jpg',
  tutoria: '/course-defaults/tutoria.jpg',
}

/** Alias cortos / variantes frecuentes del nombre en BD. */
const ALIASES = {
  'desarrollo-personal': 'desarrollo-personal-ciudadania-y-civica',
  dpcc: 'desarrollo-personal-ciudadania-y-civica',
  cyt: 'ciencia-y-tecnologia',
  ept: 'educacion-para-el-trabajo',
  religion: 'educacion-religiosa',
  'educacion-religiosa': 'educacion-religiosa',
}

export function normalizeCourseName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getDefaultCourseImage(courseName) {
  const slug = normalizeCourseName(courseName)
  if (!slug) return null

  const resolved = ALIASES[slug] || slug
  if (DEFAULT_BY_SLUG[resolved]) return DEFAULT_BY_SLUG[resolved]

  // Match por prefijo (ej. "Matemática - Cantidad" no aplica al catálogo, pero por si acaso)
  const key = Object.keys(DEFAULT_BY_SLUG).find(
    (k) => resolved.startsWith(k) || k.startsWith(resolved)
  )
  return key ? DEFAULT_BY_SLUG[key] : null
}

/**
 * URL final para tarjeta: imagen del API o default local coherente con el nombre.
 */
export function resolveCourseCardImage(apiImage, courseName) {
  if (apiImage) return apiImage
  return getDefaultCourseImage(courseName)
}

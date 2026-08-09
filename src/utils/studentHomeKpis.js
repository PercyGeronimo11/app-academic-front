/**
 * Construye la configuración de los KPI del home del estudiante.
 * Separado de la vista (SRP): la UI solo renderiza; aquí se decide contenido.
 */
export function buildStudentHomeKpiCards({
  links = {},
  myRisk = null,
  attendance = null,
  announcements = {},
  latestRequest = null,
  reportCard = null,
  notifications = {},
  riskTone = 'slate',
  riskIcon = 'fa-hourglass-half',
  formatConfidence = () => '—',
  getRiskLabel = () => 'Sin dato',
} = {}) {
  const unreadAnnouncements = Number(announcements?.unread_count || 0)
  const unreadNotifications = Number(notifications?.unread_count || 0)
  const scoresCount = Number(reportCard?.scores_count || 0)
  const coursesCount = Number(reportCard?.courses_count || 0)

  return [
    {
      id: 'risk',
      label: 'Mi nivel de riesgo',
      value: myRisk?.has_prediction
        ? (myRisk.risk_label || getRiskLabel(myRisk.risk_level))
        : 'Sin predicción',
      hint: myRisk?.has_prediction
        ? `Confianza ${formatConfidence(myRisk.confidence)}`
        : 'Aún no hay predicción para este bimestre',
      cta: 'Ver detalle',
      to: links.academic_risk || '/mi-riesgo-academico',
      icon: riskIcon,
      tone: riskTone,
    },
    {
      id: 'attendance',
      label: 'Asistencia del bimestre',
      value: attendance ? '' : '—',
      hint: 'Ver reporte general',
      cta: 'Ver reporte',
      to: links.attendance || '/assistances/alumno/reporte',
      icon: 'fa-calendar-check',
      tone: 'blue',
    },
    {
      id: 'report_card',
      label: 'Libreta de notas',
      value: reportCard ? String(scoresCount) : '—',
      hint: reportCard
        ? `${scoresCount} nota(s) en ${coursesCount} curso(s)`
        : 'Aún no hay notas registradas',
      cta: 'Ver libreta',
      to: links.report_card || '/my-report-card',
      icon: 'fa-book-open',
      tone: 'ok',
    },
    {
      id: 'announcements',
      label: 'Comunicados oficiales',
      value: String(unreadAnnouncements),
      hint: unreadAnnouncements === 1
        ? '1 comunicado sin leer'
        : `${unreadAnnouncements} comunicados sin leer`,
      cta: 'Ver comunicados',
      to: links.announcements || '/my-announcements',
      icon: 'fa-bullhorn',
      tone: 'indigo',
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      value: String(unreadNotifications),
      hint: unreadNotifications === 1
        ? '1 aviso sin leer'
        : `${unreadNotifications} avisos sin leer`,
      cta: 'Ver bandeja',
      to: links.notifications || '/my-notifications',
      icon: 'fa-bell',
      tone: unreadNotifications > 0 ? 'amber' : 'slate',
    },
    {
      id: 'requests',
      label: 'Mis trámites',
      value: latestRequest ? '' : 'Sin trámites',
      hint: latestRequest ? 'Último trámite registrado' : 'Aún no registras solicitudes',
      cta: 'Ver trámites',
      to: links.requests || '/myPaperworks',
      icon: 'fa-folder-open',
      tone: latestRequest ? 'amber' : 'slate',
    },
  ]
}

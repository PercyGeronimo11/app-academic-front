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
  riskTone = 'slate',
  riskIcon = 'fa-hourglass-half',
  formatConfidence = () => '—',
  getRiskLabel = () => 'Sin dato',
} = {}) {
  const unreadAnnouncements = Number(announcements?.unread_count || 0)

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

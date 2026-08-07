export default [
  // para profesor y estudiante

  // TODOS
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    roles: ['DIRECCION', 'AUXILIAR', 'PROFESOR', 'ESTUDIANTE', 'SECRETARIA'],
  },
  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/courses/teacher/list',
    icon: 'cil-library',
    roles: ['PROFESOR'],
  },
  {
    component: 'CNavGroup',
    name: 'Riesgo Académico',
    icon: 'cil-warning',
    roles: ['DIRECCION', 'PROFESOR', 'AUXILIAR'],
    items: [
      {
        component: 'CNavItem',
        name: 'Dashboard',
        icon: 'cil-chart-pie',
        to: '/prediccion/dashboard',
      },
      {
        component: 'CNavItem',
        name: 'Vista operativa',
        icon: 'cil-clipboard',
        to: '/prediccion/academic-risk',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Asistencias',
    icon: 'cil-calendar-check',
    roles: ['DIRECCION', 'AUXILIAR', 'SECRETARIA'],
    items: [
      {
        component: 'CNavItem',
        name: 'Registrar asistencia',
        icon: 'cil-user-follow',
        to: '/assistances/registrar?tab=qr',
      },
      {
        component: 'CNavItem',
        name: 'Seguimiento Diario',
        icon: 'cil-task',
        to: '/assistances/seguimiento',
      },
      {
        component: 'CNavItem',
        name: 'Reporte periódico',
        icon: 'cil-chart-line',
        to: '/assistances/admin/reporte-periodico',
      },
      {
        component: 'CNavItem',
        name: 'Reporte por alumnos',
        icon: 'cil-people',
        to: '/assistances/admin/list-alumnos',
      },
      {
        component: 'CNavItem',
        name: 'Justificar faltas',
        icon: 'cil-pencil',
        to: '/assistances/justificar',
      },

    ],
  },

  {
    component: 'CNavGroup',
    name: 'Comunicados',
    icon: 'cil-bullhorn',
    roles: ['DIRECCION', 'PROFESOR', 'AUXILIAR', 'SECRETARIA', 'ESTUDIANTE'],
    items: [
      {
        component: 'CNavItem',
        name: 'Comunicados oficiales',
        icon: 'cil-note-add',
        to: '/announcements/publish',
        roles: ['DIRECCION', 'PROFESOR'],
      },
      {
        component: 'CNavItem',
        name: 'Ver comunicados',
        icon: 'cil-envelope-open',
        to: '/my-announcements',
        roles: ['DIRECCION', 'PROFESOR' ],
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Trámites',
    icon: 'cil-inbox',
    roles: ['SECRETARIA'],
    items: [
      {
        component: 'CNavItem',
        name: 'Trámites Pendientes',
        icon: 'cil-task',
        to: '/mesa-tramites',
      },
      {
        component: 'CNavItem',
        name: 'Historial de trámites',
        icon: 'cil-list',
        to: '/mesa-tramites/historial',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Trámites',
    icon: 'cil-laptop',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Trámites en proceso',
        icon: 'cil-task',
        to: '/admin-tramites',
      },
      {
        component: 'CNavItem',
        name: 'Historial de trámites',
        icon: 'cil-list',
        to: '/admin-tramites/historial',
      },
    ],
  },

  {
    component: 'CNavItem',
    name: 'Trámites',
    to: '/auxiliar-tramites',
    icon: 'cil-check-circle',
    roles: ['AUXILIAR'],
  },



  {
    component: 'CNavTitle',
    name: 'Administración',
    roles: ['DIRECCION', 'SECRETARIA'],
  },
  {
    component: 'CNavItem',
    name: 'Administrativos',
    to: '/administratives',
    icon: 'cil-briefcase',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Docentes',
    to: '/teachers',
    icon: 'cil-education',
    roles: ['DIRECCION', 'SECRETARIA'],
  },
  {
    component: 'CNavItem',
    name: 'Estudiantes',
    to: '/students',
    icon: 'cil-people',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Configuraciones',
    to: '/settings?tab=periodos',
    icon: 'cil-settings',
    roles: ['DIRECCION', 'SECRETARIA'],
  },

  //   Para Estudiante

  {
    component: 'CNavGroup',
    name: 'Mis Cursos',
    icon: 'cil-library',
    roles: ['ESTUDIANTE'],
    items: [
      {
        component: 'CNavItem',
        name: 'Lista de cursos',
        icon: 'cil-list',
        to: '/courses/student/list',
      },
      {
        component: 'CNavItem',
        name: 'Record Académico',
        to: '/courses/student/academic-record',
        icon: 'cil-education',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Asistencias',
    icon: 'cil-calendar-check',
    roles: ['ESTUDIANTE'],
    items: [
      {
        component: 'CNavItem',
        name: 'Reporte General',
        icon: 'cil-chart',
        to: '/assistances/alumno/reporte',
      },
      {
        component: 'CNavItem',
        name: 'Reporte detallado',
        icon: 'cil-list',
        to: '/assistances/alumno/reporte-detallado',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Trámites',
    icon: 'cil-folder-open',
    roles: ['ESTUDIANTE'],
    items: [
      {
        component: 'CNavItem',
        name: 'Registrar trámite',
        icon: 'cil-file',
        to: '/register-paperwork',
      },
      {
        component: 'CNavItem',
        name: 'Mis trámites',
        icon: 'cil-list',
        to: '/myPaperworks',
      },
    ],
  },
  {
    component: 'CNavItem',
    name: 'Comunicados Oficiales',
    icon: 'cil-bullhorn',
     to: '/my-announcements',
    roles: ['ESTUDIANTE', 'AUXILIAR', 'SECRETARIA']
  },
  {
    component: 'CNavItem',
    name: 'Riesgo académico',
    to: '/mi-riesgo-academico',
    icon: 'cil-warning',
    roles: ['ESTUDIANTE'],
  },




]

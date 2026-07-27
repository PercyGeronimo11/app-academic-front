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
    to: '/mainAreaTeacher',
    icon: 'cil-library',
    roles: ['PROFESOR'],
  },
  {
    component: 'CNavGroup',
    name: 'Alerta Temprana',
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
    roles: ['DIRECCION', 'AUXILIAR'],
    items: [
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
        name: 'Registro QR',
        icon: 'cil-qr-code',
        to: '/assistances/auxiliar/register-qr',
      },
      {
        component: 'CNavItem',
        name: 'Registro Normal',
        icon: 'cil-pencil',
        to: '/assistances/auxiliar/register-dni',
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
    component: 'CNavItem',
    name: 'Trámites (Mesa)',
    to: '/mesa-tramites',
    icon: 'cil-inbox',
    roles: ['SECRETARIA'],
  },
  {
    component: 'CNavItem',
    name: 'Trámites virtuales',
    to: '/admin-tramites',
    icon: 'cil-laptop',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Permisos derivados',
    to: '/auxiliar-tramites',
    icon: 'cil-check-circle',
    roles: ['AUXILIAR'],
  },

  {
    component: 'CNavItem',
    name: 'Cursos',
    to: '/courses',
    icon: 'cil-book',
    roles: ['DIRECCION'],
  },

  {
    component: 'CNavTitle',
    name: 'USUARIOS',
    roles: ['DIRECCION'],
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
    roles: ['DIRECCION'],
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
    to: '/settings/general',
    icon: 'cil-settings',
    roles: ['DIRECCION'],
  },

  //   Para Profesor
  {
    component: 'CNavTitle',
    name: 'ADMINISTRACIÓN',
    roles: ['PROFESOR'],
  },


  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaTeacher',
    icon: 'cil-library',
    roles: ['PROFESOR'],
  },

  //   Para Estudiante

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
    component: 'CNavItem',
    name: 'Comunicados',
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

  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaStudent',
    icon: 'cil-library',
    roles: ['ESTUDIANTE'],
  },

  {
    component: 'CNavItem',
    name: 'Trámites',
    to: '/myPaperworks',
    icon: 'cil-folder-open',
    roles: ['ESTUDIANTE'],
  },
]

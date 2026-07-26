export default [
  // para profesor y estudiante
  {
    component: 'CNavItem',
    name: 'Area Principal',
    to: '/classroom/main',
    icon: 'cil-home',
    roles: ['PROFESOR', 'ESTUDIANTE'],
  },
  // TODOS
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    roles: ['DIRECCION', 'AUXILIAR'],
  },

  // DIRECCION O ADMINISTRATIVO
  /*   {
    component: 'CNavItem',
    name: 'Chatbot',
    to: '/chatbot',
    icon: 'cil-chat-bubble',
    roles: ['DIRECCION',],
  }, */
  {
    component: 'CNavGroup',
    name: 'Alerta Temprana',
    icon: 'cil-warning',
    roles: ['DIRECCION', 'PROFESOR', 'AUXILIAR', 'ESTUDIANTE'],
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
    name: 'ASISTENCIAS',
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
    component: 'CNavItem',
    name: 'Configuraciones',
    to: '/settings/general',
    icon: 'cil-settings',
    roles: ['DIRECCION'],
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
        roles: ['DIRECCION', 'PROFESOR', 'AUXILIAR', 'SECRETARIA', 'ESTUDIANTE'],
      },
    ],
  },

  // TRAMITES VIRTUALES
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
    name: 'Mis Trámites',
    to: '/myPaperworks',
    icon: 'cil-folder-open',
    roles: ['ESTUDIANTE'],
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
    name: 'Cursos',
    to: '/courses',
    icon: 'cil-book',
    roles: ['DIRECCION'],
  },

  /* {
    component: 'CNavItem',
    name: 'Asignar Cursos',
    to: '/classroom/assignment-courses',
    icon: 'cil-star',
    roles: ['DIRECCION'],
  }, */

  //   Para Profesor
  {
    component: 'CNavTitle',
    name: 'ADMINISTRACIÓN',
    roles: ['PROFESOR'],
  },

  // Profesor y alumnos

  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaTeacher',
    icon: 'cil-library',
    roles: ['PROFESOR'],
  },

  //   Para Estudiante
  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaStudent',
    icon: 'cil-library',
    roles: ['ESTUDIANTE'],
  },
  {
    component: 'CNavItem',
    name: 'Libreta de notas',
    to: '/my-report-card',
    icon: 'cil-spreadsheet',
    roles: ['ESTUDIANTE'],
  },
  {
    component: 'CNavGroup',
    name: 'ASISTENCIAS',
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
]

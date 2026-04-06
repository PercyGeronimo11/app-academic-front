import {
  cilQrCode, cilCalendar, cilPencil, cilChatBubble, cilChartLine, cilTask, cilChart,
  cilStar, cilNotes,
  cilGraph,
  cilList
} from '@coreui/icons'
export default [
  // TODOS
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    roles: ['DIRECCION', 'AUXILIAR'],
  },

  // DIRECCION O ADMINISTRATIVO
  {
    component: 'CNavItem',
    name: 'Chatbot',
    to: '/chatbot',
    icon: cilChatBubble,
    roles: ['DIRECCION',],
  },
  {
    component: 'CNavGroup',
    name: 'ASISTENCIAS',
    icon: cilCalendar,
    roles: ['DIRECCION', 'AUXILIAR'],
    items: [
      {
        component: 'CNavItem',
        name: 'Seguimiento Diario',
        icon: cilTask,
        to: '/assistances/seguimiento',
      },
      {
        component: 'CNavItem',
        name: 'Reporte periódico',
        icon: cilChart,
        to: '/assistances/admin/reporte-periodico',
      },
      {
        component: 'CNavItem',
        name: 'Reporte por alumnos',
        icon: cilList,
        to: '/assistances/admin/list-alumnos',
      },
      {
        component: 'CNavItem',
        name: 'Registro QR',
        icon: cilQrCode,
        to: '/assistances/auxiliar/register-qr',
      },
      {
        component: 'CNavItem',
        name: 'Registro Normal',
        icon: cilPencil,
        to: '/assistances/auxiliar/register-dni',
      }
    ],
  },
  {
    component: 'CNavItem',
    name: 'Aulas',
    to: '/classroom/list',
    icon: cilStar,
    roles: ['DIRECCION',],
  },
  {
    component: 'CNavItem',
    name: 'Cursos',
    to: '/courses',
    icon: 'cil-options',
    roles: ['DIRECCION',],
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
    icon: 'cil-user',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Docentes',
    to: '/teachers',
    icon: 'cil-user',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Estudiantes',
    to: '/students',
    icon: 'cil-people',
    roles: ['DIRECCION'],
  },

  // AUXILIAR
  // {
  //   component: 'CNavGroup',
  //   name: 'ASISTENCIAS',
  //   icon: cilCalendar,
  //   roles: ['AUXILIAR'],
  //   items: [

  //   ],
  // },



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
    name: 'Area Principal',
    to: '/classroom/main',
    icon: 'cil-notes',
    roles: ['PROFESOR', 'ESTUDIANTE'],
  },

  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaTeacher',
    icon: 'cil-notes',
    roles: ['PROFESOR'],
  },


  //   Para Estudiante
  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaStudent',
    icon: 'cil-options',
    roles: ['ESTUDIANTE'],
  },

  {
    component: 'CNavGroup',
    name: 'ASISTENCIAS',
    icon: cilCalendar,
    roles: ['ESTUDIANTE'],
    items: [
      {
        component: 'CNavItem',
        name: 'Reporte General',
        icon: cilChartLine,
        to: '/assistances/alumno/reporte',
      },
      {
        component: 'CNavItem',
        icon: cilNotes,
        name: 'Reporte detallado',
        to: '/assistances/alumno/reporte-detallado',
      },
    ],
  },

  {
    component: 'CNavItem',
    name: 'Mis Trámites',
    to: '/myPaperworks',
    icon: 'cil-file',
    roles: ['ESTUDIANTE'],
  },

  //MESA_PARTES
  {
    component: 'CNavItem',
    name: 'Solicitudes de Permiso',
    to: '/mesa-futs',
    icon: 'cil-options',
    roles: ['MESA_PARTES'],
  },
  {
    component: 'CNavItem',
    name: 'Trámites (Mesa)',
    to: '/mesa-tramites',
    icon: 'cil-file',
    roles: ['MESA_PARTES'],
  },
  {
    component: 'CNavItem',
    name: 'Trámites (Administración)',
    to: '/admin-tramites',
    icon: 'cil-file',
    roles: ['DIRECCION'],
  },
  {
    component: 'CNavItem',
    name: 'Permisos derivados',
    to: '/auxiliar-tramites',
    icon: 'cil-notes',
    roles: ['AUXILIAR'],
  },


  // ---------------------------------- PLANTILLA -------------------------
  /* {
    component: 'CNavTitle',
    name: 'COMPONENTES DE LA PLANTILLA ',
    roles: ['DIRECCION'],
  },

  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'CoreUI Icons',
        to: '/icons/coreui-icons',
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: 'CNavItem',
        name: 'Brands',
        to: '/icons/brands',
      },
      {
        component: 'CNavItem',
        name: 'Flags',
        to: '/icons/flags',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Base',
    to: '/base',
    icon: 'cil-puzzle',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Accordion',
        to: '/base/accordion',
      },
      {
        component: 'CNavItem',
        name: 'Breadcrumbs',
        to: '/base/breadcrumbs',
      },
      {
        component: 'CNavItem',
        name: 'Cards',
        to: '/base/cards',
      },
      {
        component: 'CNavItem',
        name: 'Carousels',
        to: '/base/carousels',
      },
      {
        component: 'CNavItem',
        name: 'Collapses',
        to: '/base/collapses',
      },
      {
        component: 'CNavItem',
        name: 'List Groups',
        to: '/base/list-groups',
      },
      {
        component: 'CNavItem',
        name: 'Navs & Tabs',
        to: '/base/navs',
      },
      {
        component: 'CNavItem',
        name: 'Paginations',
        to: '/base/paginations',
      },
      {
        component: 'CNavItem',
        name: 'Placeholders',
        to: '/base/placeholders',
      },
      {
        component: 'CNavItem',
        name: 'Popovers',
        to: '/base/popovers',
      },
      {
        component: 'CNavItem',
        name: 'Progress',
        to: '/base/progress',
      },
      {
        component: 'CNavItem',
        name: 'Spinners',
        to: '/base/spinners',
      },
      {
        component: 'CNavItem',
        name: 'Tables',
        to: '/base/tables',
      },
      {
        component: 'CNavItem',
        name: 'Tabs',
        to: '/base/tabs',
      },
      {
        component: 'CNavItem',
        name: 'Tooltips',
        to: '/base/tooltips',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Buttons',
    to: '/buttons',
    icon: 'cil-cursor',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Buttons',
        to: '/buttons/standard-buttons',
      },
      {
        component: 'CNavItem',
        name: 'Button Groups',
        to: '/buttons/button-groups',
      },
      {
        component: 'CNavItem',
        name: 'Dropdowns',
        to: '/buttons/dropdowns',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Forms',
    to: '/forms',
    icon: 'cil-notes',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Form Control',
        to: '/forms/form-control',
      },
      {
        component: 'CNavItem',
        name: 'Select',
        to: '/forms/select',
      },
      {
        component: 'CNavItem',
        name: 'Checks & Radios',
        to: '/forms/checks-radios',
      },
      {
        component: 'CNavItem',
        name: 'Range',
        to: '/forms/range',
      },
      {
        component: 'CNavItem',
        name: 'Input Group',
        to: '/forms/input-group',
      },
      {
        component: 'CNavItem',
        name: 'Floating Labels',
        to: '/forms/floating-labels',
      },
      {
        component: 'CNavItem',
        name: 'Layout',
        to: '/forms/layout',
      },
      {
        component: 'CNavItem',
        name: 'Validation',
        to: '/forms/validation',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'CoreUI Icons',
        to: '/icons/coreui-icons',
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: 'CNavItem',
        name: 'Brands',
        to: '/icons/brands',
      },
      {
        component: 'CNavItem',
        name: 'Flags',
        to: '/icons/flags',
      },
    ],
  },
  {
    component: 'CNavGroup',
    name: 'Notifications',
    to: '/notifications',
    icon: 'cil-bell',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Alerts',
        to: '/notifications/alerts',
      },
      {
        component: 'CNavItem',
        name: 'Badges',
        to: '/notifications/badges',
      },
      {
        component: 'CNavItem',
        name: 'Modals',
        to: '/notifications/modals',
      },
      {
        component: 'CNavItem',
        name: 'Toasts',
        to: '/notifications/toasts',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'Configuracion',
    to: '/pages',
    icon: 'cil-settings',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Login',
        to: '/pages/login',
      },
      {
        component: 'CNavItem',
        name: 'Register',
        to: '/pages/register',
      },

      {
        component: 'CNavItem',
        name: 'Error 404',
        to: '/pages/404',
      },
      {
        component: 'CNavItem',
        name: 'Error 500',
        to: '/pages/500',
      },
    ],
  },

  {
    component: 'CNavGroup',
    name: 'themes',
    icon: 'cil-settings',
    roles: ['DIRECCION'],
    items: [
      {
        component: 'CNavItem',
        name: 'Widgets',
        to: '/widgets',
        icon: 'cil-calculator',
        badge: {
          color: 'primary',
          text: 'NEW',
          shape: 'pill',
        },
      },
      {
        component: 'CNavItem',
        name: 'Charts',
        to: '/charts',
        icon: 'cil-chart-pie',
      },
      {
        component: 'CNavItem',
        name: 'Typography',
        to: '/theme/typography',
        icon: 'cil-pencil',
      },
      {
        component: 'CNavItem',
        name: 'Colors',
        to: '/theme/colors',
        icon: 'cil-drop',
      },
    ]
  } */
]

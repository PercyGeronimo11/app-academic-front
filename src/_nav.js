export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    roles: ['Administrador', 'Administrativo', 'Auxiliar'],
  },
  {
    component: 'CNavItem',
    name: 'Chatbot',
    to: '/chatbot',
    icon: 'cil-people',
    roles: ['Administrador', 'Administrativo'],
  },
  {
    component: 'CNavItem',
    name: 'Asistencias',
    to: '/assistances',
    icon: 'Flags',
    roles: ['Auxiliar'],
  },

  //Para administrativo
  {
    component: 'CNavItem',
    name: 'Aulas',
    to: '/classroom/list',
    icon: 'cil-star',
    roles: ['Administrador', 'Administrativo'],
  },

  {
    component: 'CNavItem',
    name: 'Asignar Cursos',
    to: '/classroom/assignment-courses',
    icon: 'cil-star',
    roles: ['Administrador', 'Administrativo'],
  },
  {
    component: 'CNavItem',
    name: 'Cursos',
    to: '/courses',
    icon: 'cil-options',
    roles: ['Administrador', 'Administrativo'],
  },
  {
    component: 'CNavTitle',
    name: 'USUARIOS',
    roles: ['Administrador'],
  },
  {
    component: 'CNavItem',
    name: 'Administrativos',
    to: '/administratives',
    icon: 'cil-user',
    roles: ['Administrador'],
  },
  {
    component: 'CNavItem',
    name: 'Docentes',
    to: '/teachers',
    icon: 'cil-user',
    roles: ['Administrador', 'Administrativo'],
  },
  {
    component: 'CNavItem',
    name: 'Estudiantes',
    to: '/students',
    icon: 'cil-people',
    roles: ['Administrador', 'Administrativo'],
  },



  //   Para Profesor  
  {
    component: 'CNavTitle',
    name: 'ADMINISTRACIÓN',
    roles: ['Profesor'],
  },

  // Profesor y alumnos
  {
    component: 'CNavItem',
    name: 'Area Principal',
    to: '/classroom/main',
    icon: 'cil-notes',
    roles: ['Profesor', 'Estudiante'],
  },

  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaTeacher',
    icon: 'cil-notes',
    roles: ['Profesor'],
  },


  //   Para Estudiante
  {
    component: 'CNavItem',
    name: 'Mis Cursos',
    to: '/mainAreaStudent',
    icon: 'cil-options',
    roles: ['Estudiante'],
  },



  // ---------------------------------- PLANTILLA -------------------------
  /* {
    component: 'CNavTitle',
    name: 'COMPONENTES DE LA PLANTILLA ',
    roles: ['Administrador', 'Administrativo'],
  },

  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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
    roles: ['Administrador', 'Administrativo'],
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

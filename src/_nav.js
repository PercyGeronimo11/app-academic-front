export default [
  {
    component: 'CNavItem',
    name: 'Inicio',
    to: '/dashboard',
    icon: 'cil-speedometer',
    roles: ['Administrador', 'Administrativo'],
  },
  {
    component: 'CNavTitle',
    name: 'MATERIAS',
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
    component: 'CNavItem',
    name: 'Show Grade Section',
    to: '/grade-section/:id',
    icon: 'cil-options',
    roles: ['Administrador', 'Administrativo'],
  },

  {
    component: 'CNavTitle',
    name: 'ADMINISTRACIÓN',
    roles: ['Profesor'],
  },
  {
    component: 'CNavItem',
    name: 'Área Principal',
    to: '/mainArea',
    icon: 'cil-options',
    roles: ['Estudiante'],
  },
  {
    component: 'CNavItem',
    name: 'Área Principal',
    to: '/mainAreaTeacher',
    icon: 'cil-options',
    roles: ['Profesor'],
  },
  {
    component: 'CNavItem',
    name: 'Notas',
    to: '/teachers',
    icon: 'cil-notes',
    roles: ['Profesor'],
  },
  {
    component: 'CNavItem',
    name: 'Asistencias',
    to: '/teachers',
    icon: 'cil-notes',
    roles: ['Profesor'],
  },
  {
    component: 'CNavGroup',
    name: 'Aulas de clases',
    to: '/classroom',
    icon: 'cil-star',
    roles: ['Administrador', 'Administrativo'],
    items: [
      {
        component: 'CNavItem',
        name: 'Asignacion de cursos',
        to: '/classroom/assignment-courses',
      },
      {
        component: 'CNavItem',
        name: 'Lista',
        to: '/classroom/list',
        roles: ['Administrador', 'Administrativo'],
      },
    ],
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
  {
    component: 'CNavGroup',
    name: 'Cursos',
    to: '/cursos',
    icon: 'cil-star',
    roles: ['Administrador', 'Administrativo'],
    items: [
      {
        component: 'CNavItem',
        name: 'Listado',
        to: '/classroom/grade/section/course/information',
      },
      {
        component: 'CNavItem',
        name: 'Asignacion',
        to: '/classroom/grade/section/course/participations',
      },
    ],
  },

  {
    component: 'CNavTitle',
    name: 'Configuraciones',
    roles: ['Administrador'],
  },
  {
    component: 'CNavGroup',
    name: 'Configuracion',
    to: '/pages',
    icon: 'cil-settings',
    items: [
      {
        component: 'CNavItem',
        name: 'Roles',
        to: '/teachers'
      },
      {
        component: 'CNavItem',
        name: 'Usuarios',
        to: '/theme/colors'
      },
    ],
    roles: ['Administrador'],
  },

  // ---------------------------------- PLANTILLA -------------------------
  {
    component: 'CNavTitle',
    name: 'COMPONENTES DE LA PLANTILLA ',
  },

  {
    component: 'CNavGroup',
    name: 'Icons',
    to: '/icons',
    icon: 'cil-star',
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
    name: 'Base',
    to: '/base',
    icon: 'cil-puzzle',
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
  }
]

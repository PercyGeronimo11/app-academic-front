import { h, resolveComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login'),
  },
  {
    path: '',
    name: 'Inicio',
    component: DefaultLayout,
    redirect: '/login',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () =>
          import('@/views/Dashboard.vue'),
      },
      {
        path: '/teachers',
        name: 'Docente',
        component: () => import('@/views/teachers/Teacher.vue'),
      },
      {
        path: '/administratives',
        name: 'Administrativo',
        component: () => import('@/views/administratives/Administrative.vue')
      },
      {
        path: '/students',
        name: 'Estudiante',
        component: () => import('@/views/students/Student.vue'),
      },
      {
        path: '/new-student',
        name: 'NuevoEstudiante',
        component: () => import('@/views/students/NewStudent.vue'),
      },
      {
        path: '/edit-student/:id',
        name: 'editStudent',
        component: () => import('@/views/students/EditStudent.vue'),
      },
      {
        path: '/courses',
        name: 'courses',
        component: () => import('@/views/course/Course.vue'),
      },
      {
        path: '/assignStudents',
        name: 'Asignar estudiantes',
        component: () => import('@/views/assign_students/AssignStudent.vue'),
      },
      {
        path: '/classroom/',
        children: [
          {
            path: 'assignment-courses',
            name: 'Asignar Cursos',
            component: () => import('@/views/classroom/AssignmentCourses.vue'),
          },
          {
            path: ':grade/:section/:id/teachers',
            name: 'Asignar Profesores',
            component: () => import('@/views/classroom/AssignmentTeachers.vue'),
          },
          {
            path: ':grade/:section/:id/students',
            name: 'Lista de estudiantes',
            component: () => import('@/views/classroom/DetailClassroom.vue'),
          },
          {
            path: 'list',
            name: 'Lista de Aulas',
            component: () => import('@/views/classroom/ListClassroom.vue'),
          },
          {
            path: ':grade/:section',
            name: 'Detalle del aula',
            component: () => import('@/views/classroom/DetailClassroom.vue'),
          },
        ],
      },
      {
        path: '/grade-section',
        name: 'Aulas',
        component: () => import('@/views/administratives/MainGradeSection.vue'),
      },
      {
        path: '/assingNotes/:course_id/:id',
        name: 'AssingNotes',
        component: () => import('@/views/assign_notes/AssignNotes.vue'),
      },
      {
        path: '/chatbot',
        name: 'Chatbot',
        component: () => import('@/views/chatbot/ChatBot.vue'),
      },

      //Para profesor
      {
        path: '/mainAreaTeacher',
        name: 'Mis Cursos',
        component: () => import('@/views/main_area_teacher/AreaTeacher.vue'),
      },
      
      {
        path: '/teacher/:courseClass/horary',
        name: 'Horario',
        component: () => import('@/views/main_area_teacher/Horary.vue'),
      },
      {
        path: '/teacher/:courseClass/assistance-students/:date',
        name: 'Toma de asistencias',
        component: () => import('@/views/main_area_teacher/AssistanceStudents.vue'),
      },
      {
        path: '/teacher/:courseClass/assistance-dates',
        name: 'Lista de asistencias',
        component: () => import('@/views/main_area_teacher/AssistanceDates.vue'),
      },
      {
        path: '/teacher/:courseClass/detalle',
        name: 'Detalle del curso',
        component: () => import('@/views/main_area_teacher/CourseDetail.vue'),
      },

      // Para estudiantes
      {
        path: '/mainAreaStudent',
        name: 'Área Principal para estudiante',
        component: () => import('@/views/main_area_student/MainAreaStudent.vue'),
      },
      {
        path: '/student/courseClass/:courseClass/detalle',
        name: 'Detalle del curso para estudiante',
        component: () => import('@/views/main_area_student/CourseDetail.vue'),
      },
      {
        path: '/student/courseClass/:courseClass/assistance',
        name: 'Asistencias del alumno',
        component: () => import('@/views/main_area_student/AssistanceView.vue'),
      },


      //Para estudiantes y profesores

      {
        path: '/classroom/main',
        name: 'Area principal',
        component: () => import('@/views/main_area_general/MainArea.vue'),
      },

      // {
      //   path: '/classroom/:grade/:section/:id/teachers',
      //   name: 'Asignar Profesores',
      //   component: () => import('@/views/classroom/AssignmentTeachers.vue'),
      // },
      // {
      //   path: '/classroom/:grade/:section/:id/students',
      //   name: 'Lista de estudiantes',
      //   component: () => import('@/views/classroom/DetailClassroom.vue'),
      // },
      // {
      //   path: '/classroom/list',
      //   name: 'Lista de Aulas',
      //   component: () => import('@/views/classroom/ListClassroom.vue'),
      // },
      // {
      //   path: '/classroom/:grade/:section',
      //   name: 'Detalle del aula',
      //   component: () => import('@/views/classroom/DetailClassroom.vue'),
      // },




      {
        path: '/class/grade/:course_class_id/:unit_id',
        name: 'StudentScores',
        component: () => import('@/views/reports/reportScore.vue'),
      },
      {
        path: '/class/grade/:course_class_id',
        name: 'StudentAssistence',
        component: () => import('@/views/reports/reportAssistence.vue'),
      },
      // ------------------------RUTAS DE LA PLANTILLA---------------------
      {
        path: '/theme',
        name: 'Theme',
        redirect: '/theme/typography',
      },
      {
        path: '/theme/colors',
        name: 'Colors',
        component: () => import('@/components/theme/Colors.vue'),
      },
      {
        path: '/theme/typography',
        name: 'Typography',
        component: () => import('@/components/theme/Typography.vue'),
      },
      {
        path: '/base',
        name: 'Base',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/base/breadcrumbs',
        children: [
          {
            path: '/base/accordion',
            name: 'Accordion',
            component: () => import('@/components/base/Accordion.vue'),
          },
          {
            path: '/base/breadcrumbs',
            name: 'Breadcrumbs',
            component: () => import('@/components/base/Breadcrumbs.vue'),
          },
          {
            path: '/base/cards',
            name: 'Cards',
            component: () => import('@/components/base/Cards.vue'),
          },
          {
            path: '/base/carousels',
            name: 'Carousels',
            component: () => import('@/components/base/Carousels.vue'),
          },
          {
            path: '/base/collapses',
            name: 'Collapses',
            component: () => import('@/components/base/Collapses.vue'),
          },
          {
            path: '/base/list-groups',
            name: 'List Groups',
            component: () => import('@/components/base/ListGroups.vue'),
          },
          {
            path: '/base/navs',
            name: 'Navs',
            component: () => import('@/components/base/Navs.vue'),
          },
          {
            path: '/base/paginations',
            name: 'Paginations',
            component: () => import('@/components/base/Paginations.vue'),
          },
          {
            path: '/base/placeholders',
            name: 'Placeholders',
            component: () => import('@/components/base/Placeholders.vue'),
          },
          {
            path: '/base/popovers',
            name: 'Popovers',
            component: () => import('@/components/base/Popovers.vue'),
          },
          {
            path: '/base/progress',
            name: 'Progress',
            component: () => import('@/components/base/Progress.vue'),
          },
          {
            path: '/base/spinners',
            name: 'Spinners',
            component: () => import('@/components/base/Spinners.vue'),
          },
          {
            path: '/base/tables',
            name: 'Tables',
            component: () => import('@/components/base/Tables.vue'),
          },
          {
            path: '/base/tabs',
            name: 'Tabs',
            component: () => import('@/components/base/Tabs.vue'),
          },
          {
            path: '/base/tooltips',
            name: 'Tooltips',
            component: () => import('@/components/base/Tooltips.vue'),
          },
        ],
      },
      {
        path: '/buttons',
        name: 'Buttons',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/buttons/standard-buttons',
        children: [
          {
            path: '/buttons/standard-buttons',
            name: 'Buttons',
            component: () => import('@/components/buttons/Buttons.vue'),
          },
          {
            path: '/buttons/dropdowns',
            name: 'Dropdowns',
            component: () => import('@/components/buttons/Dropdowns.vue'),
          },
          {
            path: '/buttons/button-groups',
            name: 'Button Groups',
            component: () => import('@/components/buttons/ButtonGroups.vue'),
          },
        ],
      },
      {
        path: '/forms',
        name: 'Forms',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/forms/form-control',
        children: [
          {
            path: '/forms/form-control',
            name: 'Form Control',
            component: () => import('@/components/forms/FormControl.vue'),
          },
          {
            path: '/forms/select',
            name: 'Select',
            component: () => import('@/components/forms/Select.vue'),
          },
          {
            path: '/forms/checks-radios',
            name: 'Checks & Radios',
            component: () => import('@/components/forms/ChecksRadios.vue'),
          },
          {
            path: '/forms/range',
            name: 'Range',
            component: () => import('@/components/forms/Range.vue'),
          },
          {
            path: '/forms/input-group',
            name: 'Input Group',
            component: () => import('@/components/forms/InputGroup.vue'),
          },
          {
            path: '/forms/floating-labels',
            name: 'Floating Labels',
            component: () => import('@/components/forms/FloatingLabels.vue'),
          },
          {
            path: '/forms/layout',
            name: 'Layout',
            component: () => import('@/components/forms/Layout.vue'),
          },
          {
            path: '/forms/validation',
            name: 'Validation',
            component: () => import('@/components/forms/Validation.vue'),
          },
        ],
      },
      {
        path: '/charts',
        name: 'Charts',
        component: () => import('@/components/charts/Charts.vue'),
      },
      {
        path: '/icons',
        name: 'Icons',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/icons/coreui-icons',
        children: [
          {
            path: '/icons/coreui-icons',
            name: 'CoreUI Icons',
            component: () => import('@/components/icons/CoreUIIcons.vue'),
          },
          {
            path: '/icons/brands',
            name: 'Brands',
            component: () => import('@/components/icons/Brands.vue'),
          },
          // Bastante grande su importacion, en la construccion sale advertencia
          // {
          //   path: '/icons/flags',
          //   name: 'Flags',
          //   component: () => import('@/components/icons/Flags.vue'),
          // },
        ],
      },
      {
        path: '/notifications',
        name: 'Notifications',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/notifications/alerts',
        children: [
          {
            path: '/notifications/alerts',
            name: 'Alerts',
            component: () => import('@/components/notifications/Alerts.vue'),
          },
          {
            path: '/notifications/badges',
            name: 'Badges',
            component: () => import('@/components/notifications/Badges.vue'),
          },
          {
            path: '/notifications/modals',
            name: 'Modals',
            component: () => import('@/components/notifications/Modals.vue'),
          },
          {
            path: '/notifications/toasts',
            name: 'Toasts',
            component: () => import('@/components/notifications/Toasts.vue'),
          },
        ],
      },
      {
        path: '/widgets',
        name: 'Widgets',
        component: () => import('@/components/widgets/Widgets.vue'),
      },
    ],
  },

  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '404',
        name: 'Page404',
        component: () => import('@/components/pages/Page404'),
      },
      {
        path: '500',
        name: 'Page500',
        component: () => import('@/components/pages/Page500'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/components/pages/Register'),
      },
    ],
  },
  // Redirigir a login si la ruta no existe
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token'); 

  if (to.name !== 'Login' && !isAuthenticated && isAuthenticated!="undefined") {
    next({ name: 'Login' }); // Redirige al login si no está autenticado
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ path: '/dashboard' }); // Redirige al dashboard si está autenticado e intenta ir al login
  } else {
    next(); // Permite la navegación
  }
});

export default router

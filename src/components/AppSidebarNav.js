import { defineComponent, h, onMounted, ref, resolveComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { CBadge, CSidebarNav, CNavItem, CNavGroup, CNavTitle } from '@coreui/vue'
import nav from '@/_nav.js'
import CryptoJS from 'crypto-js';

import simplebar from 'simplebar-vue'
import 'simplebar-vue/dist/simplebar.min.css'

const normalizePath = (path) =>
  decodeURI(path).replace(/#.*$/, '').replace(/(index)?\.(html)$/, '')

const isActiveLink = (route, link) => {
  if (link === undefined) return false
  const currentPath = normalizePath(route.path)
  const targetPath = normalizePath(link)
  return currentPath === targetPath || route.hash === link
}

const isActiveItem = (route, item) => {
  return isActiveLink(route, item.to) || (item.items && item.items.some((child) => isActiveItem(route, child)))
}

const filterNavByRole = (navItems, role) => {
  return navItems.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false
    if (item.items) item.items = filterNavByRole(item.items, role) // Filtrar subgrupos también
    return true
  })
}

const AppSidebarNav = defineComponent({
  name: 'AppSidebarNav',
  components: { CNavItem, CNavGroup, CNavTitle },
  setup() {
    const route = useRoute()
    const firstRender = ref(true)

    onMounted(() => {
      firstRender.value = false
    })

    const role_key = localStorage.getItem('r_key') || 'guest' // Obtener rol del localStorage
    const secretKey = import.meta.env.VITE_ROLE_KEY.toString();
    const decryptedRol = CryptoJS.AES.decrypt(role_key, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedRol);
    
    const filteredNav = filterNavByRole(nav, decryptedRol) // Filtrar menú según rol

    const renderItem = (item) => {
      if (item.items) {
        return h(
          CNavGroup,
          {
            as: 'div',
            compact: true,
            ...(firstRender.value && {
              visible: item.items.some((child) => isActiveItem(route, child)),
            }),
          },
          {
            togglerContent: () => [
              h(resolveComponent('CIcon'), { customClassName: 'nav-icon', name: item.icon }),
              item.name,
            ],
            default: () => item.items.map((child) => renderItem(child)),
          }
        )
      }

      return item.to
        ? h(
            RouterLink,
            { to: item.to, custom: true },
            {
              default: (props) =>
                h(
                  resolveComponent(item.component),
                  {
                    active: props.isActive,
                    as: 'div',
                    href: props.href,
                    onClick: () => props.navigate(),
                  },
                  {
                    default: () => [
                      item.icon
                        ? h(resolveComponent('CIcon'), { customClassName: 'nav-icon', name: item.icon })
                        : h('span', { class: 'nav-icon' }, h('span', { class: 'nav-icon-bullet' })),
                      item.name,
                      item.badge &&
                        h(CBadge, { class: 'ms-auto', color: item.badge.color }, () => item.badge.text),
                    ],
                  }
                ),
            }
          )
        : h(resolveComponent(item.component), { as: 'div' }, () => item.name)
    }

    return () =>
      h(
        CSidebarNav,
        { as: simplebar },
        { default: () => filteredNav.map((item) => renderItem(item)) }
      )
  },
})

export { AppSidebarNav }

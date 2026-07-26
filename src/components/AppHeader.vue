<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useColorModes } from '@coreui/vue'

import AppHeaderDropdownAccnt from '@/components/AppHeaderDropdownAccnt.vue'
import AppNotificationBell from '@/components/AppNotificationBell.vue'
import { useSidebarStore } from '@/stores/sidebar.js'

const { colorMode, setColorMode } = useColorModes('coreui-free-vue-admin-template-theme')
const sidebar = useSidebarStore()
const route = useRoute()

const scrolled = ref(false)
const onScroll = () => {
  scrolled.value = document.documentElement.scrollTop > 0
}

const currentTitle = computed(() => route.meta?.title || route.name || 'Inicio')

const colorModeLabel = computed(() => {
  if (colorMode.value === 'dark') return 'Tema oscuro'
  if (colorMode.value === 'light') return 'Tema claro'
  return 'Tema automático'
})

onMounted(() => document.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => document.removeEventListener('scroll', onScroll))
</script>

<template>
  <CHeader position="sticky" class="mb-4 p-0" :class="{ 'shadow-sm': scrolled }">
    <CContainer class="border-bottom px-4" fluid>
      <CHeaderToggler
        aria-label="Mostrar u ocultar el menú lateral"
        style="margin-inline-start: -14px"
        @click="sidebar.toggleVisible()"
      >
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>

      <div class="app-header-title">
        <span class="app-header-title__eyebrow">I.E. Ricardo Palma 80010</span>
        <span class="app-header-title__current">{{ currentTitle }}</span>
      </div>

      <CHeaderNav class="ms-auto">
        <AppNotificationBell />
      </CHeaderNav>
      <CHeaderNav>
        <CDropdown variant="nav-item" placement="bottom-end">
          <CDropdownToggle :caret="false" :aria-label="colorModeLabel">
            <CIcon v-if="colorMode === 'dark'" icon="cil-moon" size="lg" />
            <CIcon v-else-if="colorMode === 'light'" icon="cil-sun" size="lg" />
            <CIcon v-else icon="cil-contrast" size="lg" />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              :active="colorMode === 'light'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('light')"
            >
              <CIcon class="me-2" icon="cil-sun" size="lg" /> Claro
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'dark'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('dark')"
            >
              <CIcon class="me-2" icon="cil-moon" size="lg" /> Oscuro
            </CDropdownItem>
            <CDropdownItem
              :active="colorMode === 'auto'"
              class="d-flex align-items-center"
              component="button"
              type="button"
              @click="setColorMode('auto')"
            >
              <CIcon class="me-2" icon="cil-contrast" size="lg" /> Automático
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
        <li class="nav-item py-1 d-none d-sm-block">
          <div class="vr h-100 mx-2 text-body text-opacity-25"></div>
        </li>
        <AppHeaderDropdownAccnt />
      </CHeaderNav>
    </CContainer>
  </CHeader>
</template>

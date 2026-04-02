<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { logo } from '@/assets/brand/logo'
import { sygnet } from '@/assets/brand/sygnet'
import { AppSidebarNav } from '@/components/AppSidebarNav.js'
import { useSidebarStore } from '@/stores/sidebar.js'
import CryptoJS from 'crypto-js' // Importa CryptoJS

// Store del sidebar
const sidebar = useSidebarStore()

// Router para realizar redirecciones programáticamente
const router = useRouter()

// Obtener el rol del usuario desencriptado
const getUserRole = () => {
  const role_key = localStorage.getItem('r_key') || 'guest' // Rol encriptado
  const secretKey = import.meta.env.VITE_ROLE_KEY.toString() // Clave secreta desde .env

  try {
    const decryptedRole = CryptoJS.AES.decrypt(role_key, secretKey).toString(CryptoJS.enc.Utf8)
    return decryptedRole || 'guest' // Si no se puede desencriptar, se usa 'guest'
  } catch (error) {
    console.error('Error al desencriptar el rol:', error)
    return 'guest' // En caso de error, rol por defecto
  }
}

// Navegación condicional según el rol desencriptado
const navigateByRole = () => {
  const role = getUserRole()
  
  if (role == 'DIRECCION') {
    router.push('/')
  } else if (role == 'PROFESOR') {
    router.push('/mainAreaTeacher')
  } else if (role == 'ESTUDIANTE') {
    router.push('/mainArea')
  }
   else {
    router.push('/') // Ruta por defecto para roles desconocidos
  }
}
</script>

<template>
  <CSidebar
    class="custom-sidebar border-end"
    colorScheme="dark"
    position="fixed"
    :unfoldable="sidebar.unfoldable"
    :visible="sidebar.visible"
    @visible-change="(value) => sidebar.toggleVisible(value)"
  >
    <CSidebarHeader>
      <RouterLink custom>
        <CSidebarBrand as="a" @click="navigateByRole">
          <img v-if="sidebar.unfoldable"
            custom-class-name="sidebar-brand-full"
            src="/src/assets/images/logo.png"
            :height="65"
          />
          <img v-if="!sidebar.unfoldable"
            custom-class-name="sidebar-brand-full"
            src="/src/assets/images/logo-main.png"
            :height="85"
          />
        </CSidebarBrand>
      </RouterLink>
      <CCloseButton class="d-lg-none" dark @click="sidebar.toggleVisible()" />
    </CSidebarHeader>
    <AppSidebarNav />
    <CSidebarFooter class="d-none d-lg-flex">
      <CSidebarToggler @click="sidebar.toggleUnfoldable()" />
    </CSidebarFooter>
  </CSidebar>
</template>
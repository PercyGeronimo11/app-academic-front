<script setup>
import { useRouter } from 'vue-router'
import { AppSidebarNav } from '@/components/AppSidebarNav.js'
import { useSidebarStore } from '@/stores/sidebar.js'

const sidebar = useSidebarStore()
const router = useRouter()

const navigateByRole = () => {
  router.push('/dashboard')
}
</script>

<template>
  <CSidebar
    class="custom-sidebar"
    colorScheme="dark"
    position="fixed"
    :unfoldable="sidebar.unfoldable"
    :visible="sidebar.visible"
    @visible-change="(value) => sidebar.toggleVisible(value)"
  >
    <CSidebarHeader>
      <CSidebarBrand as="a" role="button" @click="navigateByRole">
        <img
          class="sidebar-logo"
          :class="{ 'sidebar-logo--compact': sidebar.unfoldable }"
          src="@/assets/images/logo.png"
          alt="I.E. Ricardo Palma 80010"
        />
        <span v-if="!sidebar.unfoldable" class="sidebar-brand-text">
          <span class="sidebar-brand-text__eyebrow">I.E. 80010</span>
          <span class="sidebar-brand-text__name">Ricardo Palma</span>
        </span>
      </CSidebarBrand>
      <CCloseButton class="d-lg-none" dark @click="sidebar.toggleVisible()" />
    </CSidebarHeader>
    <AppSidebarNav />
    <CSidebarFooter class="d-none d-lg-flex">
      <CSidebarToggler @click="sidebar.toggleUnfoldable()" />
    </CSidebarFooter>
  </CSidebar>
</template>

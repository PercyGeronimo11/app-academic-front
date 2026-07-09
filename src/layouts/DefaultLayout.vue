<script setup>
import { onMounted, onUnmounted } from 'vue'
import { CContainer } from '@coreui/vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNotificationBanner from '@/components/AppNotificationBanner.vue'
import { useUserNotifications } from '@/composables/useUserNotifications'
import { hasValidSession } from '@/utils/session'

const { startPolling, stopPolling, requestBrowserPermission } = useUserNotifications()

onMounted(() => {
  if (hasValidSession()) {
    requestBrowserPermission()
    startPolling()
  }
})

onUnmounted(stopPolling)
</script>

<template>
  <div>
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <AppNotificationBanner />
      <div class="body flex-grow-1">
        <CContainer class="px-4" lg>
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
  </div>
</template>

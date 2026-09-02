<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { CContainer } from '@coreui/vue'
import AnnouncementLoginModal from '@/components/announcements/AnnouncementLoginModal.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppNotificationBanner from '@/components/AppNotificationBanner.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AssistantFab from '@/components/asistente/AssistantFab.vue'
import { ensurePushRegistration } from '@/composables/usePushNotifications'
import { useUserNotifications } from '@/composables/useUserNotifications'
import { hasValidSession } from '@/utils/session'

const route = useRoute()
const showFab = computed(() => route.name !== 'AsistenteInteligente')
const isAssistancesRoute = computed(() => String(route.path || '').startsWith('/assistances'))

const { startPolling, stopPolling, requestBrowserPermission } = useUserNotifications()

onMounted(() => {
  ensurePushRegistration()

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
        <CContainer
          :class="isAssistancesRoute ? 'px-2 px-sm-3 assistances-container' : 'px-4'"
          :fluid="isAssistancesRoute"
          :lg="!isAssistancesRoute"
        >
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
    <AssistantFab v-if="showFab" />
    <AnnouncementLoginModal />
  </div>
</template>

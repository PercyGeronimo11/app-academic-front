<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { CContainer } from '@coreui/vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppNotificationBanner from '@/components/AppNotificationBanner.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AssistantFab from '@/components/asistente/AssistantFab.vue'
import { ensureStudentPushRegistration } from '@/composables/usePushNotifications'
import { useUserNotifications } from '@/composables/useUserNotifications'
import { hasValidSession } from '@/utils/session'

const route = useRoute()
const showFab = computed(() => route.name !== 'AsistenteInteligente')
const { startPolling, stopPolling, requestBrowserPermission } = useUserNotifications()

onMounted(() => {
  ensureStudentPushRegistration()

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
    <AssistantFab v-if="showFab" />
  </div>
</template>

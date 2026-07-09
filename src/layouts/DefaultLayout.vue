<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CContainer } from '@coreui/vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AssistantFab from '@/components/asistente/AssistantFab.vue'
import { ensureStudentPushRegistration } from '@/composables/usePushNotifications'

const route = useRoute()
const showFab = computed(() => route.name !== 'AsistenteInteligente')

onMounted(() => {
  ensureStudentPushRegistration()
})
</script>

<template>
  <div>
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
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

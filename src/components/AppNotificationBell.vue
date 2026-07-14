<template>
  <CNavItem class="d-flex align-items-center">
    <router-link to="/my-notifications" class="nav-link notification-bell" title="Notificaciones">
      <CIcon icon="cil-bell" size="lg" />
      <CBadge v-if="unreadCount > 0" color="danger" class="notification-badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </CBadge>
    </router-link>
  </CNavItem>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserNotifications } from '@/composables/useUserNotifications';

const { unreadCount, refreshCount } = useUserNotifications();

onMounted(refreshCount);
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.65rem;
  min-width: 1.1rem;
  padding: 0.15rem 0.3rem;
  transform: translate(25%, -25%);
}
</style>

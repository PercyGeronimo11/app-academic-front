<template>
  <Transition name="gmail-banner">
    <div
      v-if="latestBanner"
      class="gmail-banner"
      role="alert"
      @click="handleClick"
    >
      <div class="gmail-banner-icon">
        <i class="fas fa-envelope"></i>
      </div>
      <div class="gmail-banner-content">
        <div class="gmail-banner-title">{{ latestBanner.title }}</div>
        <div class="gmail-banner-body">{{ latestBanner.body }}</div>
      </div>
      <button type="button" class="gmail-banner-close" aria-label="Cerrar" @click.stop="dismissBanner">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserNotifications } from '@/composables/useUserNotifications';

const router = useRouter();
const { latestBanner, dismissBanner } = useUserNotifications();

const handleClick = () => {
  dismissBanner();
  router.push('/my-notifications');
};
</script>

<style scoped>
.gmail-banner {
  position: fixed;
  top: calc(4rem + 0.25rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1030;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: min(420px, calc(100vw - 1.5rem));
  padding: 0.75rem 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  border-left: 4px solid #1a73e8;
  cursor: pointer;
}

.gmail-banner-icon {
  color: #1a73e8;
  font-size: 1.1rem;
  padding-top: 0.15rem;
}

.gmail-banner-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #202124;
  margin-bottom: 0.15rem;
}

.gmail-banner-body {
  font-size: 0.82rem;
  color: #5f6368;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gmail-banner-close {
  background: none;
  border: none;
  color: #5f6368;
  padding: 0.15rem;
  margin-left: auto;
  cursor: pointer;
}

.gmail-banner-enter-active,
.gmail-banner-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.gmail-banner-enter-from,
.gmail-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>

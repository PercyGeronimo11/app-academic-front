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
  top: calc(var(--rp-header-height) + var(--rp-space-1));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--rp-z-banner);
  display: flex;
  align-items: flex-start;
  gap: var(--rp-space-3);
  width: min(26rem, calc(100vw - var(--rp-space-6)));
  padding: var(--rp-space-3) var(--rp-space-4);
  background: var(--rp-surface);
  border: 1px solid var(--rp-border);
  border-left: 3px solid var(--rp-brand-500);
  border-radius: var(--rp-radius-md);
  box-shadow: var(--rp-shadow-md);
  cursor: pointer;
}

.gmail-banner-icon {
  color: var(--rp-brand-500);
  font-size: var(--rp-text-lg);
  padding-top: 0.1rem;
}

.gmail-banner-content {
  min-width: 0;
}

.gmail-banner-title {
  font-weight: var(--rp-weight-semibold);
  font-size: var(--rp-text-base);
  color: var(--rp-text-heading);
  margin-bottom: var(--rp-space-1);
}

.gmail-banner-body {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-muted);
  line-height: var(--rp-leading-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.gmail-banner-close {
  background: none;
  border: none;
  color: var(--rp-text-subtle);
  font-size: var(--rp-text-base);
  padding: var(--rp-space-1);
  margin-left: auto;
  cursor: pointer;
  border-radius: var(--rp-radius-xs);
  transition: color var(--rp-transition-fast), background-color var(--rp-transition-fast);
}

.gmail-banner-close:hover {
  color: var(--rp-text);
  background: var(--rp-surface-hover);
}

.gmail-banner-enter-active,
.gmail-banner-leave-active {
  transition: opacity var(--rp-transition-base), transform var(--rp-transition-base);
}

.gmail-banner-enter-from,
.gmail-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-0.75rem);
}

@media (max-width: 575.98px) {
  .gmail-banner {
    width: calc(100vw - var(--rp-space-4));
    padding: var(--rp-space-3);
    gap: var(--rp-space-2);
  }
}
</style>

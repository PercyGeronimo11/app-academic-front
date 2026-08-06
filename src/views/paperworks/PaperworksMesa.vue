<template>
  <StaffPaperworksBoard :key="mode" variant="mesa" :mode="mode" />
</template>

<script setup>
import StaffPaperworksBoard from '@/components/paperworks/StaffPaperworksBoard.vue';

defineProps({
  mode: {
    type: String,
    default: 'inbox',
  },
});
</script>

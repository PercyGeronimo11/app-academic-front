<template>
  <div class="module-page my-announcements">
    <ModulePageHeader
      icon="fas fa-bullhorn"
      title="Comunicados oficiales"
      subtitle="Información institucional publicada para su grado."
    />

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando comunicados...
    </div>

    <EmptyState
      v-else-if="!announcements.length"
      icon="📢"
      title="No hay comunicados"
      hint="Cuando la institución publique un comunicado para su grado, aparecerá aquí."
    />

    <div v-else class="inbox-list">
      <article
        v-for="item in announcements"
        :key="item.id"
        class="inbox-item"
        :class="{ 'inbox-item--unread': !item.is_read }"
        @click="openAnnouncement(item)"
      >
        <div class="inbox-item__icon">
          <i class="fas fa-bullhorn"></i>
        </div>
        <div class="inbox-item__content">
          <div class="inbox-item__title-row">
            <span class="inbox-item__title">{{ item.title }}</span>
            <span class="priority-badge" :class="`priority-badge--${item.priority}`">
              {{ priorityLabel(item.priority) }}
            </span>
          </div>
          <div class="inbox-item__excerpt">{{ item.excerpt }}</div>
          <div class="inbox-item__meta">
            <i class="far fa-clock me-1"></i>{{ item.published_at }}
            <span v-if="item.publisher_name"> · {{ item.publisher_name }}</span>
          </div>
        </div>
        <span v-if="!item.is_read" class="inbox-item__dot" aria-hidden="true"></span>
      </article>
    </div>

    <CModal :visible="detailVisible" @close="closeDetail" size="lg">
      <CModalHeader>
        <CModalTitle>{{ selectedItem?.title }}</CModalTitle>
      </CModalHeader>
      <CModalBody v-if="selectedItem">
        <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
          <span class="priority-badge" :class="`priority-badge--${selectedItem.priority}`">
            {{ priorityLabel(selectedItem.priority) }}
          </span>
          <span class="text-body-secondary small">{{ selectedItem.published_at }}</span>
        </div>
        <p v-if="selectedItem.publisher_name" class="text-body-secondary small mb-3">
          <i class="fas fa-user me-1"></i>Publicado por: {{ selectedItem.publisher_name }}
        </p>
        <div class="announcement-detail-body">{{ selectedItem.body }}</div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="closeDetail">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const route = useRoute();

const announcements = ref([]);
const loading = ref(true);
const loadError = ref('');
const detailVisible = ref(false);
const selectedItem = ref(null);

const priorityLabels = {
  normal: 'Normal',
  importante: 'Importante',
  urgente: 'Urgente',
};

const priorityLabel = (value) => priorityLabels[value] || value;

const loadAnnouncements = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await OfficialAnnouncementService.listMine();
    if (response.data.success) {
      announcements.value = response.data.data || [];
    } else {
      loadError.value = response.data.message || 'No se pudieron cargar los comunicados.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar comunicados.';
  } finally {
    loading.value = false;
  }
};

const openAnnouncement = async (item) => {
  try {
    const response = await OfficialAnnouncementService.getMine(item.id);
    if (response.data.success) {
      selectedItem.value = response.data.data;
      detailVisible.value = true;
      item.is_read = true;
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'No se pudo abrir el comunicado.';
  }
};

const closeDetail = () => {
  detailVisible.value = false;
  selectedItem.value = null;
};

const openFromQuery = async () => {
  const id = Number(route.query.id);
  if (!id) return;

  const existing = announcements.value.find((item) => item.id === id);
  if (existing) {
    await openAnnouncement(existing);
    return;
  }

  try {
    const response = await OfficialAnnouncementService.getMine(id);
    if (response.data.success) {
      selectedItem.value = response.data.data;
      detailVisible.value = true;
    }
  } catch {
    // ignore invalid deep link
  }
};

onMounted(async () => {
  await loadAnnouncements();
  await openFromQuery();
});
</script>

<template>
  <div class="module-page">
    <ModulePageHeader
      icon="fas fa-bell"
      title="Notificaciones"
      subtitle="Avisos recientes e incidentes de conducta."
    >
      <template #actions>
        <CButton
          v-if="notifications.some((n) => !n.is_read)"
          size="sm"
          color="light"
          variant="outline"
          class="text-white border-white"
          @click="markAllRead"
        >
          <i class="fas fa-check-double me-2"></i>Marcar todas como leídas
        </CButton>
      </template>
    </ModulePageHeader>

    <div v-if="loading" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <EmptyState
      v-else-if="!notifications.length"
      icon="🔔"
      title="Sin notificaciones"
      hint="Cuando reciba avisos del sistema, aparecerán en esta bandeja."
      compact
    />

    <div v-else class="inbox-list mb-4">
      <article
        v-for="item in notifications"
        :key="item.id"
        class="inbox-item"
        :class="{ 'inbox-item--unread': !item.is_read }"
        @click="openNotification(item)"
      >
        <div class="inbox-item__icon">
          <i class="fas fa-envelope"></i>
        </div>
        <div class="inbox-item__content">
          <div class="inbox-item__title">{{ item.title }}</div>
          <div class="inbox-item__excerpt">{{ item.body }}</div>
          <div class="inbox-item__meta">
            <i class="far fa-clock me-1"></i>{{ item.created_at }}
          </div>
        </div>
        <span v-if="!item.is_read" class="inbox-item__dot" aria-hidden="true"></span>
      </article>
    </div>

    <div v-if="incidents.length" class="module-card">
      <div class="module-card__header">
        <i class="fas fa-exclamation-triangle me-2"></i>Mis incidentes de conducta
      </div>
      <div class="modern-table-shell" style="border: none; box-shadow: none; border-radius: 0">
        <CTable hover responsive class="mb-0">
          <CTableHead class="modern-table-header">
            <CTableRow>
              <CTableHeaderCell>Fecha</CTableHeaderCell>
              <CTableHeaderCell>Curso</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Gravedad</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="item in incidents" :key="item.id">
              <CTableDataCell>{{ item.incident_date }}</CTableDataCell>
              <CTableDataCell>{{ item.course_name }}</CTableDataCell>
              <CTableDataCell>{{ typeLabel(item.incident_type) }}</CTableDataCell>
              <CTableDataCell>
                <span class="priority-badge" :class="severityClass(item.severity)">
                  {{ severityLabel(item.severity) }}
                </span>
              </CTableDataCell>
              <CTableDataCell class="small">{{ item.description }}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserNotificationService from '@/services/UserNotificationService';
import ConductIncidentService from '@/services/ConductIncidentService';
import { useUserNotifications } from '@/composables/useUserNotifications';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const { refreshCount } = useUserNotifications();
const router = useRouter();

const notifications = ref([]);
const incidents = ref([]);
const loading = ref(true);

const typeLabels = {
  comportamiento_inadecuado: 'Comportamiento inadecuado',
  agresion: 'Agresión',
  irrespeto: 'Irrespeto',
  uso_celular: 'Uso de celular',
  otro: 'Otro',
};

const severityLabels = {
  leve: 'Leve',
  moderado: 'Moderado',
  grave: 'Grave',
  muy_grave: 'Muy grave',
  critico: 'Crítico',
};
const typeLabel = (v) => typeLabels[v] || v;
const severityLabel = (v) => severityLabels[v] || v;
const severityClass = (v) => {
  if (v === 'critico' || v === 'muy_grave') return 'priority-badge--urgente';
  if (v === 'grave' || v === 'moderado') return 'priority-badge--importante';
  return 'priority-badge--normal';
};

const load = async () => {
  loading.value = true;
  try {
    const [notifRes, historyRes] = await Promise.all([
      UserNotificationService.list(),
      ConductIncidentService.myHistory().catch(() => ({ data: { data: [] } })),
    ]);
    notifications.value = notifRes.data?.data ?? [];
    incidents.value = historyRes.data?.data ?? [];
    await refreshCount();
  } finally {
    loading.value = false;
  }
};

const openNotification = async (item) => {
  if (!item.is_read) {
    await UserNotificationService.markAsRead(item.id);
    item.is_read = true;
    await refreshCount();
  }

  if (item.type === 'official_announcement' && item.data?.announcement_id) {
    router.push({
      path: '/my-announcements',
      query: { id: item.data.announcement_id },
    });
  }
};

const markAllRead = async () => {
  await UserNotificationService.markAllAsRead();
  notifications.value = notifications.value.map((n) => ({ ...n, is_read: true }));
  await refreshCount();
};

onMounted(load);
</script>

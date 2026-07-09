<template>
  <div class="module-page announcements-publish">
    <ModulePageHeader
      icon="fas fa-bullhorn"
      title="Comunicados oficiales"
      subtitle="Publique información institucional dirigida a grados específicos."
    />

    <div v-if="loadError" class="module-alert module-alert--error">{{ loadError }}</div>
    <div v-if="successMessage" class="module-alert module-alert--success">{{ successMessage }}</div>

    <div class="module-card mb-4">
      <div class="module-card__header">
        <i class="fas fa-pen-to-square me-2"></i>Nuevo comunicado
      </div>
      <div class="module-card__body">
        <CForm @submit.prevent="submitForm">
          <div class="row g-3">
            <div class="col-12">
              <CFormLabel for="title">Título</CFormLabel>
              <CFormInput
                id="title"
                v-model="form.title"
                maxlength="200"
                placeholder="Ej. Suspensión de clases por feriado"
                required
              />
            </div>

            <div class="col-12">
              <CFormLabel for="body">Contenido</CFormLabel>
              <CFormTextarea
                id="body"
                v-model="form.body"
                rows="5"
                placeholder="Redacte el comunicado oficial..."
                required
              />
            </div>

            <div class="col-md-4">
              <CFormLabel for="priority">Prioridad</CFormLabel>
              <CFormSelect id="priority" v-model="form.priority">
                <option value="normal">Normal</option>
                <option value="importante">Importante</option>
                <option value="urgente">Urgente</option>
              </CFormSelect>
            </div>

            <div class="col-12">
              <CFormLabel>Grados destinatarios</CFormLabel>
              <div v-if="loadingGrades" class="module-loading">
                <i class="fas fa-spinner fa-spin"></i> Cargando grados...
              </div>
              <EmptyState
                v-else-if="!gradeOptions.length"
                icon="🏫"
                title="Sin grados disponibles"
                hint="No tiene grados asignados para publicar comunicados."
                compact
              />
              <div v-else class="grade-check-grid">
                <label v-for="grade in gradeOptions" :key="grade.id">
                  <input
                    v-model="form.grade_section_ids"
                    type="checkbox"
                    class="form-check-input m-0"
                    :value="grade.id"
                  />
                  <span>{{ grade.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2 flex-wrap mt-4">
            <CButton type="submit" color="primary" :disabled="saving || !canSubmit">
              <i class="fas fa-paper-plane me-2"></i>
              {{ saving ? 'Publicando...' : 'Publicar comunicado' }}
            </CButton>
            <CButton
              type="button"
              color="secondary"
              variant="outline"
              :disabled="saving || !canSubmit"
              @click="saveDraft"
            >
              <i class="fas fa-save me-2"></i>Guardar borrador
            </CButton>
          </div>
        </CForm>
      </div>
    </div>

    <h3 class="module-section-title">Mis comunicados</h3>

    <div v-if="loadingList" class="module-loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <EmptyState
      v-else-if="!publishedList.length"
      icon="📭"
      title="Sin comunicados registrados"
      hint="Los comunicados que publique o guarde como borrador aparecerán aquí."
      compact
    />

    <div v-else class="modern-table-shell">
      <CTable hover responsive class="mb-0">
        <CTableHead class="modern-table-header">
          <CTableRow>
            <CTableHeaderCell>Fecha</CTableHeaderCell>
            <CTableHeaderCell>Título</CTableHeaderCell>
            <CTableHeaderCell>Estado</CTableHeaderCell>
            <CTableHeaderCell>Prioridad</CTableHeaderCell>
            <CTableHeaderCell>Destinatarios</CTableHeaderCell>
            <CTableHeaderCell class="text-center">Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          <CTableRow v-for="item in publishedList" :key="item.id">
            <CTableDataCell class="small">{{ item.published_at || '—' }}</CTableDataCell>
            <CTableDataCell class="fw-semibold">{{ item.title }}</CTableDataCell>
            <CTableDataCell>
              <span
                class="status-badge"
                :class="item.status === 'publicado' ? 'status-badge--publicado' : 'status-badge--borrador'"
              >
                {{ item.status === 'publicado' ? 'Publicado' : 'Borrador' }}
              </span>
            </CTableDataCell>
            <CTableDataCell>
              <span class="priority-badge" :class="`priority-badge--${item.priority}`">
                {{ priorityLabel(item.priority) }}
              </span>
            </CTableDataCell>
            <CTableDataCell class="small text-body-secondary">{{ item.target_labels }}</CTableDataCell>
            <CTableDataCell class="text-center">
              <CButton
                v-if="item.status === 'borrador'"
                size="sm"
                color="primary"
                class="me-1"
                @click="publishDraft(item)"
              >
                Publicar
              </CButton>
              <CButton size="sm" color="info" variant="outline" @click="openDetail(item)">
                Ver
              </CButton>
            </CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <CModal :visible="detailVisible" @close="detailVisible = false" size="lg">
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
        <p class="text-body-secondary small mb-3">
          <i class="fas fa-users me-1"></i>{{ selectedItem.target_labels }}
        </p>
        <div class="announcement-detail-body">{{ selectedItem.body }}</div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" @click="detailVisible = false">Cerrar</CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import OfficialAnnouncementService from '@/services/OfficialAnnouncementService';
import ModulePageHeader from '@/components/academic/ModulePageHeader.vue';
import EmptyState from '@/components/academic/EmptyState.vue';

const gradeOptions = ref([]);
const publishedList = ref([]);
const loadingGrades = ref(true);
const loadingList = ref(true);
const saving = ref(false);
const loadError = ref('');
const successMessage = ref('');
const detailVisible = ref(false);
const selectedItem = ref(null);

const form = ref({
  title: '',
  body: '',
  priority: 'normal',
  grade_section_ids: [],
});

const canSubmit = computed(() => {
  return (
    form.value.title.trim().length >= 3 &&
    form.value.body.trim().length >= 10 &&
    form.value.grade_section_ids.length > 0
  );
});

const priorityLabels = {
  normal: 'Normal',
  importante: 'Importante',
  urgente: 'Urgente',
};

const priorityLabel = (value) => priorityLabels[value] || value;

const resetForm = () => {
  form.value = {
    title: '',
    body: '',
    priority: 'normal',
    grade_section_ids: [],
  };
};

const loadGrades = async () => {
  loadingGrades.value = true;
  try {
    const response = await OfficialAnnouncementService.getTargetGrades();
    if (response.data.success) {
      gradeOptions.value = response.data.data || [];
    } else {
      loadError.value = response.data.message || 'No se pudieron cargar los grados.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar grados.';
  } finally {
    loadingGrades.value = false;
  }
};

const loadPublished = async () => {
  loadingList.value = true;
  try {
    const response = await OfficialAnnouncementService.listPublished();
    if (response.data.success) {
      publishedList.value = response.data.data || [];
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al cargar comunicados.';
  } finally {
    loadingList.value = false;
  }
};

const createAnnouncement = async (publish) => {
  if (!canSubmit.value) return;

  saving.value = true;
  loadError.value = '';
  successMessage.value = '';

  try {
    const response = await OfficialAnnouncementService.create({
      title: form.value.title.trim(),
      body: form.value.body.trim(),
      priority: form.value.priority,
      grade_section_ids: form.value.grade_section_ids,
      publish,
    });

    if (response.data.success) {
      successMessage.value = response.data.message;
      resetForm();
      await loadPublished();
    } else {
      loadError.value = response.data.message || 'No se pudo guardar el comunicado.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al guardar el comunicado.';
  } finally {
    saving.value = false;
  }
};

const submitForm = () => createAnnouncement(true);
const saveDraft = () => createAnnouncement(false);

const openDetail = async (item) => {
  try {
    const response = await OfficialAnnouncementService.getItem(item.id);
    if (response.data.success) {
      selectedItem.value = response.data.data;
      detailVisible.value = true;
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'No se pudo cargar el detalle.';
  }
};

const publishDraft = async (item) => {
  saving.value = true;
  loadError.value = '';
  successMessage.value = '';
  try {
    const response = await OfficialAnnouncementService.publish(item.id);
    if (response.data.success) {
      successMessage.value = response.data.message;
      await loadPublished();
    } else {
      loadError.value = response.data.message || 'No se pudo publicar el borrador.';
    }
  } catch (error) {
    loadError.value = error.response?.data?.message || 'Error al publicar el borrador.';
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadGrades(), loadPublished()]);
});
</script>

<template>
  <CModal :visible="visible" alignment="center" scrollable size="lg" @close="$emit('close')">
    <CModalHeader>
      <CModalTitle>
        <i class="fas fa-eye me-2"></i>
        Detalle del incidente
      </CModalTitle>
    </CModalHeader>
    <CModalBody v-if="incident">
      <dl class="detail-grid mb-0">
        <div>
          <dt>Fecha</dt>
          <dd>{{ formatDate(incident.incident_date) }}</dd>
        </div>
        <div>
          <dt>Alumno</dt>
          <dd>{{ incident.student_name || '—' }}</dd>
        </div>
        <div>
          <dt>Tipo</dt>
          <dd>{{ typeLabel(incident.incident_type) }}</dd>
        </div>
        <div>
          <dt>Severidad</dt>
          <dd>{{ severityLabel(incident.severity) }}</dd>
        </div>
        <div>
          <dt>Docente</dt>
          <dd>{{ incident.teacher_name || '—' }}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{{ statusLabel(incident.status) }}</dd>
        </div>
        <div>
          <dt>Curso</dt>
          <dd>{{ incident.course_name || '—' }}</dd>
        </div>
        <div>
          <dt>Registrado</dt>
          <dd>{{ incident.created_at || '—' }}</dd>
        </div>
        <div class="detail-grid__full">
          <dt>Descripción</dt>
          <dd class="detail-description">{{ incident.description || '—' }}</dd>
        </div>
      </dl>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="$emit('close')">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  incident: { type: Object, default: null },
  typeLabel: { type: Function, required: true },
  severityLabel: { type: Function, required: true },
  statusLabel: { type: Function, required: true },
  formatDate: { type: Function, required: true },
})

defineEmits(['close'])
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem 1.25rem;
}

.detail-grid__full {
  grid-column: 1 / -1;
}

.detail-grid dt {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--rp-text-muted);
  margin-bottom: 0.2rem;
}

.detail-grid dd {
  margin: 0;
  color: var(--rp-text-heading);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.detail-description {
  font-weight: 500 !important;
  white-space: pre-wrap;
  line-height: 1.45;
}

@media (min-width: 576px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

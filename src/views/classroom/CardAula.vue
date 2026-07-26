<template>
  <div
    @click="openModal(true)"
    class="card"
    :class="gradeClass"
  >
    <div class="card-content">
      <h3 class="card-title">{{ grade }} {{ section }}</h3>
    </div>
  </div>

  <!-- Modal -->
  <CModal
    :visible="isModalOpen"
    scrollable
    size="lg"
    @close="openModal(false)"
    alignment="center"
  >
    <CModalHeader>
      <CModalTitle>Seleccionar Opción</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CContainer>
        <CRow class="text-center mb-4">
          <CCol>
            <p class="text-muted">Elija una opción para continuar:</p>
          </CCol>
        </CRow>
        <CRow class="justify-content-center">
          <CCol md="6" class="d-grid gap-2">
            <CButton color="primary" size="lg" @click="viewTeachers">
              👨‍🏫 Ver Profesores
            </CButton>
          </CCol>
          <CCol md="6" class="d-grid gap-2">
            <CButton color="success" size="lg" @click="viewStudents">
              👩‍🎓 Ver Alumnos
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="openModal(false)">Cerrar</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { defineProps, computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isModalOpen = ref(false);

const props = defineProps({
  section: String,
  grade: String,
  id: Number,
});

// Asignar clase según el grado
const gradeClass = computed(() => {
  const name = props.grade?.toLowerCase() || "";
  if (name.includes("primero")) return "first";
  if (name.includes("segundo")) return "second";
  if (name.includes("tercero")) return "third";
  if (name.includes("cuarto")) return "fourth";
  if (name.includes("quinto")) return "fifth";
  if (name.includes("sexto")) return "sixth";
  return "default";
});

const openModal = (isOpen) => (isModalOpen.value = isOpen);
const viewTeachers = () =>
  router.push(`/classroom/${props.grade}/${props.section}/${props.id}/teachers`);
const viewStudents = () =>
  router.push(`/classroom/${props.grade}/${props.section}/${props.id}/students`);
</script>

<style scoped>
.card {
  width: 100%;
  max-width: 100%;
  min-height: 7rem;
  padding: var(--rp-space-5);
  border: 1px solid var(--rp-border);
  border-inline-start: 3px solid var(--rp-neutral-400);
  border-radius: var(--rp-radius-lg);
  background: var(--rp-surface);
  box-shadow: var(--rp-shadow-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--rp-text);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast), border-color var(--rp-transition-fast);
}

.card:hover {
  background: var(--rp-surface-hover);
  border-color: var(--rp-border-brand);
}

.card-title {
  margin: 0;
  font-size: var(--rp-text-xl);
  font-weight: var(--rp-weight-semibold);
  line-height: var(--rp-leading-tight);
  color: var(--rp-text-heading);
  text-transform: capitalize;
  overflow-wrap: break-word;
}

/* El grado se identifica por el color del filete lateral, no por el relleno. */
.card.first {
  border-inline-start-color: var(--rp-brand-300);
}

.card.second {
  border-inline-start-color: var(--rp-brand-400);
}

.card.third {
  border-inline-start-color: var(--rp-brand-500);
}

.card.fourth {
  border-inline-start-color: var(--rp-brand-600);
}

.card.fifth {
  border-inline-start-color: var(--rp-accent-400);
}

.card.sixth {
  border-inline-start-color: var(--rp-accent-600);
}

.card.default {
  border-inline-start-color: var(--rp-neutral-400);
}

@media (max-width: 575.98px) {
  .card {
    min-height: 5.5rem;
    padding: var(--rp-space-4);
  }

  .card-title {
    font-size: var(--rp-text-lg);
  }
}
</style>

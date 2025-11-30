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
/* 🌟 Base general */
.card {
  width: 100%;
  max-width: 340px;
  height: 160px;
  margin: 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-family: "Poppins", sans-serif;
  transition: all 0.35s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* ✨ Animación y brillo al pasar el mouse */
.card::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.15),
    transparent 70%
  );
  transform: scale(0);
  transition: transform 0.5s ease;
}

.card:hover::before {
  transform: scale(1);
}

.card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.card-content {
  z-index: 2;
}

.card-title {
  font-size: 1.9rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  text-transform: capitalize;
  line-height: 1.2;
}

.card:hover .card-title {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7),
    0 0 20px rgba(255, 255, 255, 0.4);
}

/* 🎨 Colores según el grado */

/* Primero → Azul cielo */
.card.first {
  background: linear-gradient(135deg, #3b82f6, #2563eb, #1e40af);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

/* Segundo → Verde menta */
.card.second {
  background: linear-gradient(135deg, #10b981, #059669, #064e3b);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

/* Tercero → Naranja cálido */
.card.third {
  background: linear-gradient(135deg, #f59e0b, #d97706, #92400e);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

/* Cuarto → Violeta intenso */
.card.fourth {
  background: linear-gradient(135deg, #9333ea, #7e22ce, #581c87);
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
}

/* Quinto → Rojo coral */
.card.fifth {
  background: linear-gradient(135deg, #ef4444, #b91c1c, #7f1d1d);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

/* Sexto → Turquesa brillante */
.card.sixth {
  background: linear-gradient(135deg, #06b6d4, #0891b2, #0e7490);
  box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
}

/* Por defecto → Gris azulado */
.card.default {
  background: linear-gradient(135deg, #64748b, #475569, #334155);
  box-shadow: 0 8px 20px rgba(71, 85, 105, 0.4);
}
</style>

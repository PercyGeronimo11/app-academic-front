<template>
  <div @click="openModal(true)" class="card">
    <div v-if="image" class="image-wrapper">
      <img :src="image" alt="Imagen del Curso" class="card-image" />
    </div>
    <div v-else class="no-image" :style="{ backgroundColor: solidColor }">
      <span class="no-image-text">{{ grade.charAt(0) }}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ grade }} {{ section }}</h3>
    </div>
  </div>

  <CModal
    :visible="isModalOpen"
    scrollable
    size="lg"
    @close="openModal(false)"
    alignment="center"
  >
    <CModalHeader>
      <CModalTitle id="LiveDemoExampleLabel">Seleccionar Opción</CModalTitle>
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
            <CButton color="primary" size="lg" @click="viewCourses">
              Ver Cursos
            </CButton>
          </CCol>
          <CCol md="6" class="d-grid gap-2">
            <CButton color="success" size="lg" @click="viewStudents">
              Ver Alumnos
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

const router=useRouter();
const isModalOpen = ref(false);

// Definir las props del componente
const props = defineProps({
  section: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  id: {
    type: Number,
    required: true,
  },
});

// Computed para obtener el color sólido basado en la primera letra del título
const solidColor = computed(() => {
  const colorMap = {
    A: "#FF6B6B",
    B: "#4ECDC4",
    C: "#FF9F1C",
    D: "#1A535C",
    E: "#FF6F61",
    F: "#2A9D8F",
    G: "#F4A261",
    H: "#264653",
    I: "#E76F51",
    J: "#E9C46A",
    K: "#F4A460",
    L: "#A5B4FC",
    M: "#C3DAFE",
    N: "#FDE68A",
    O: "#E9A8D4",
    P: "#86EFAC",
    Q: "#8A4D76",
    R: "#8338EC",
    S: "#3A86FF",
    T: "#FB5607",
    U: "#FF006E",
    V: "#FFD166",
    W: "#06D6A0",
    X: "#118AB2",
    Y: "#073B4C",
    Z: "#EF476F",
  };
  return colorMap[props.grade.charAt(0).toUpperCase()] || "#A0AEC0";
});

const handleCardClick = () => {
  window.location.href = `/classroom/${props.grade}/${props.section}/${props.id}`;
};

// Abrir el modal al hacer clic en la tarjeta
const openModal = (isOpen) => {
  isModalOpen.value = isOpen;
};

const viewCourses = () => {
  router.push(`/classroom/${props.grade}/${props.section}/courses`);
};

const viewStudents = () => {
  router.push(`/classroom/${props.grade}/${props.section}/students`);
};
</script>

<style scoped>
.card {
  width: 100%;
  max-width: 320px;
  margin: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  background-color: white;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.image-wrapper {
  height: 160px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-image-text {
  font-size: 2rem;
  color: white;
  font-weight: bold;
}

.card-content {
  padding: 15px;
  text-align: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.text-center {
  text-align: center;
}
</style>

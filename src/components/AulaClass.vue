<template>
 <div @click="handleClick" class="card">
    <div v-if="image" class="image-wrapper">
      <img :src="image" alt="Imagen del Curso" class="card-image" />
    </div>
    <div v-else class="no-image" :style="{ backgroundColor: solidColor }">
      <span class="no-image-text">{{ title.charAt(0) }}</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

// Definir las props del componente
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true, 
  },
});


// Computed para obtener el color sólido basado en la primera letra del título
const solidColor = computed(() => {
  const colorMap = {
    A: "#FF6B6B", B: "#4ECDC4", C: "#FF9F1C", D: "#1A535C",
    E: "#FF6F61", F: "#2A9D8F", G: "#F4A261", H: "#264653",
    I: "#E76F51", J: "#E9C46A", K: "#F4A460", L: "#A5B4FC",
    M: "#C3DAFE", N: "#FDE68A", O: "#E9A8D4", P: "#86EFAC",
    Q: "#8A4D76", R: "#8338EC", S: "#3A86FF", T: "#FB5607",
    U: "#FF006E", V: "#FFD166", W: "#06D6A0", X: "#118AB2",
    Y: "#073B4C", Z: "#EF476F"
  };
  return colorMap[props.title.charAt(0).toUpperCase()] || "#A0AEC0";
});
const emit = defineEmits(['cardClick']);

const handleClick = () => {
  emit('cardClick', props.id); // Emitimos el evento con el id del grade section
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
</style>

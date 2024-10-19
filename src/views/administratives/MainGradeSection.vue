<template>
  <div class="gradeSections-wrapper">
    <div v-if="filteredGradeSections.length" class="gradeSections-container">
      <AulaClass
        v-for="(gradeSection, index) in filteredGradeSections"
        :key="index"
        :title="gradeSection.title"
        :id="gradeSection.id" 
        @cardClick="handleCardClick"
      />
    </div>
    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AulaClass from "@/components/AulaClass.vue";
import GradeSectionService from "@/services/GradeSectionService";

const gradeSections = ref([]); 

const filteredGradeSections = computed(() =>
  gradeSections.value.filter((gradeSection) => {
    return gradeSection.title;
  })
);

const listItems = async () => {
  try {
    const data = { idPeriod: 1 };
    const response = await GradeSectionService.getGradeSections();
    const listGradeSections = response.data.data;

    console.log("lista:"+listGradeSections);
    gradeSections.value = listGradeSections.map((gradeSection) => ({
      id: gradeSection.id,
      title: gradeSection.grade_name + " - " + gradeSection.section_name,
    }));

    console.log("datos: "+gradeSections.value); 
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
  }
};
const handleCardClick = (id_grade_section) => {
  window.location.href = `/grade-section/${id_grade_section}`;
};

onMounted(listItems);
</script>

<style scoped>
.gradeSections-wrapper {
  padding: 20px;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.gradeSections-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  justify-items: center;
}

.no-results {
  text-align: center;
  font-size: 1.25rem;
  color: #555;
}
</style>

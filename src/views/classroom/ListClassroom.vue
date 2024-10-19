<template>
  <div class="gradeSections-wrapper">
    <div v-if="listGradeSections.length" class="gradeSections-container">
      <CardAula
        v-for="(gradeSection, index) in listGradeSections"
        :key="index"
        :id="gradeSection.id" 
        :grade="gradeSection.grade_name"
        :section="gradeSection.section_name"
      />
    </div>
    <p v-else class="no-results">No se encontraron cursos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import CardAula from "@/views/classroom/CardAula.vue";
import GradeSectionService from "@/services/GradeSectionService";


const listGradeSections = ref([]);

const listItems = async () => {
  try {

    const response = await GradeSectionService.getGradeSections();
    listGradeSections.value = response.data.data;
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
  }
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

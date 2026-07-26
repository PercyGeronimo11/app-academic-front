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
  padding-block: var(--rp-space-5);
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--rp-space-5);
  flex-wrap: wrap;
  gap: var(--rp-space-3);
}

.gradeSections-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
  gap: var(--rp-space-4);
}

.no-results {
  text-align: center;
  font-size: var(--rp-text-md);
  color: var(--rp-text-muted);
  padding: var(--rp-space-10) var(--rp-space-4);
}
</style>

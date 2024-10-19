<template>
  <div class="course-section">
    <h1 class="course-title">CURSO DE MATEMÁTICA</h1>
    <CRow class="mb-3">
        <SectionDetail
          title="Descripción general del curso"
          description="Descripción breve del curso"
        />
      </CRow>
    <div v-for="(unit, index) in units" :key="index">
      <h2 @click="toggleUnitVisibility(index)" class="unit-title">
        Unidad {{ index + 1 }}
        <i :class="unit.isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </h2>
      <CRow v-if="unit.isVisible" class="mb-3">
        <div v-for="item in unit.items" :key="item.id">
          <SectionDetail
            :title="item.title"
            :description="item.description"
          />
        </div>
      </CRow>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SectionDetail from "./SectionDetail.vue";
import { items } from './sectionData.js';

const units = ref([
  { isVisible: true, 
    items: items.slice(0, 2) 
  },
  { isVisible: true, 
    items: items.slice(2, 4) 
  }, 
  { isVisible: true, 
    items: items.slice(4, 5) 
  },
]);


function toggleUnitVisibility(index) {
  units.value[index].isVisible = !units.value[index].isVisible;
}
</script>

<style scoped>
.course-title {
  color: #034285;
  text-align: center;
  margin-bottom: 1.5em;
  transition: color 0.3s;
}

.unit-title {
  cursor: pointer;
  color: #0056b3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.2em;
  margin-top: 1em;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
  transition: color 0.3s;
}

.unit-title:hover {
  color: #004094;
}

i {
  margin-left: 10px;
}
</style>

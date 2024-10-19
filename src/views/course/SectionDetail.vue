<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4 p-3 card-custom">
        <div class="section-header">
          <strong>{{ title }}</strong>
        </div>
        <div class="section-content">
          <p>{{ description }}</p>
        </div>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
});
</script>

<style scoped>
.card-custom {
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #fdfdfd;
}

.section-header {
  border-bottom: 2px solid #013368;
  margin-bottom: 15px;
  padding-bottom: 8px;
  font-size: 1.5em;
  color: #333;
}

.section-content p {
  font-size: 1.1em;
  line-height: 1.5;
  color: #666;
  margin: 0;
}
</style>

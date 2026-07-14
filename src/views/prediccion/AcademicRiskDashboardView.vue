<template>
  <CRow class="mb-3">
    <CCol>
      <CCard class="shadow-sm border-0">
        <CCardBody class="py-4 px-4">
          <h4 class="fw-bold text-primary mb-3">
            <i class="fas fa-chart-line me-2"></i>
            Dashboard de Alerta Temprana
          </h4>
          <div class="dashboard-placeholder">
            <CIcon icon="cil-chart-pie" size="3xl" class="text-body-secondary mb-3" />
            <p class="mb-0 fs-5 text-body-secondary">Dashboard disponible próximamente.</p>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<style scoped>
.dashboard-placeholder {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #c8ced3;
  border-radius: 0.75rem;
  background: #f8f9fa;
}
</style>

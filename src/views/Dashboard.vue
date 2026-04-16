<template>
  <div>
    <CRow v-if="loading" class="mb-3">
      <CCol>
        <p class="text-body-secondary mb-0">Cargando estadísticas...</p>
      </CCol>
    </CRow>

    <CRow v-else :xs="{ gutter: 4 }">
      <CCol
        v-for="(role, index) in roleStats"
        :key="role.id"
        :sm="6"
        :xl="4"
        :xxl="3"
      >
        <CWidgetStatsA :color="widgetColor(index)">
          <template #value>{{ role.name }}</template>
          <template #title>{{ role.count }}</template>
          <template #action>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
                <CIcon icon="cil-options" class="text-white" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem href="#">Action</CDropdownItem>
                <CDropdownItem href="#">Another action</CDropdownItem>
                <CDropdownItem href="#">Something else here</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </template>
          <template #chart>
            <CChart
              type="bar"
              class="mt-3 mx-3"
              style="height: 70px"
            />
          </template>
        </CWidgetStatsA>
      </CCol>
    </CRow>

    <CRow class="mt-4">
      <CCol>
        <div class="dashboard-staff-photo">
          <img
            src="/img/personal_colegio.png"
            alt="Personal del colegio"
            class="img-fluid rounded shadow-sm w-100"
          />
        </div>
      </CCol>
    </CRow>
  </div>
</template>
<script setup>
import DashboardService from '@/services/DashboardService'
import { computed, onMounted, ref } from 'vue'

const WIDGET_COLORS = ['danger', 'success', 'warning', 'info', 'primary', 'dark', 'secondary']

const dashboard = ref(null)
const loading = ref(true)

const roleStats = computed(() => dashboard.value?.roles ?? [])

const widgetColor = (index) => WIDGET_COLORS[index % WIDGET_COLORS.length]

onMounted(async () => {
  try {
    await listDashboard()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

const listDashboard = async () => {
  const response = await DashboardService.getItems()

  const roles = response.data.data?.roles || []

  dashboard.value = {
    ...response.data.data,
    roles: roles.map(item => ({
      ...item
    }))
  }
}
</script>

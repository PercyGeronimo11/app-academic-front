<template>
  <CRow :xs="{ gutter: 4 }">
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="danger">
        <template #value
          >ADMINISTRATIVOS
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>6</template>
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
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="success">
        <template #value
          >ESTUDIANTES
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>641</template>
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
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="warning">
        <template #value
          >PROFESORES
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>67</template>
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
</template>
<script setup>
import DashboardService from '@/services/DashboardService'
import { onMounted, ref } from 'vue';

var dashboard = ref();

onMounted(async () => {
  try {
    await listDashboard();
  } catch (error) {
    console.error(error);
  }
});

const listDashboard = async () => {
  const response = await DashboardService.getItems();
  dashboard.value = response.data.data;
}
</script>



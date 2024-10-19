<template>
<div>
    <div class="mb-2">
      <h1>Lista de Alumnos de {{ gradeName }} {{ sectionName }}</h1>
      <CRow class="mb-3">
        <CCol>
          <CInputGroup>
            <CFormInput v-model="searchData" placeholder="Buscar por apellido, nombre o DNI"
              aria-label="Buscar por apellido, nombre o DNI" aria-describedby="button-addon2" />
            <CButton type="button" color="primary" id="button-addon2" >Buscar</CButton>
          </CInputGroup>
        </CCol>
        <CCol></CCol>
        <CCol class="d-grid gap-2 d-md-flex justify-content-md-end">
            <router-link to="/new-student" class="CButton" >
            <CButton color="info text-white" >Nuevo</CButton>
            </router-link>
        </CCol>
      </CRow>
    </div>
    <CTable align="middle" class="mb-0 border" hover responsive>
      <CTableHead class="text-nowrap">
        <CTableRow>
          <CTableHeaderCell class="bg-body-secondary text-center">
            #
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            Nombres y apellidos
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            DNI
          </CTableHeaderCell>
          <CTableHeaderCell class="bg-body-secondary text-center">
            N° celular
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="item in listStudents" :key="item.name">
          <CTableDataCell>
            <div class="text-center">{{ item.id }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.name }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.dni }}</div>
          </CTableDataCell>
          <CTableDataCell>
            <div class="text-center">{{ item.representative_phone }}</div>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CourseClassService from "@/services/CourseClassService";
import StudentService from "@/services/StudentService";
import GradeSectionService from "@/services/GradeSectionService";
import {useRoute} from "vue-router";

const route=useRoute();

const gradeName = route.params.grade;
const sectionName = route.params.section; 

const listStudents = ref([]); 

const listStudentService = async () => {
  const response = await StudentService.getItems();
  listStudents.value = response.data.data;
  console.log("estoo:", gradeName);
}

onMounted(listStudentService);
</script>

<style scoped>

</style>

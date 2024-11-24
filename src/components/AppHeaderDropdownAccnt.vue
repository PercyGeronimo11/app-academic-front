<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <span class="me-2"
        ><b>{{ userData.role_user }}: {{ userData.name_user }} </b>
      </span>
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>

    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        Perfil de {{ userData.role_user }}
      </CDropdownHeader>
      <CDropdownItem> <CIcon icon="cil-user" /> {{ userData.name_user }} </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-envelope-open" /> {{ userData.email_user }}
      </CDropdownItem>
      <!-- <CDropdownItem>
        <CIcon icon="cil-task" /> Tasks
        <CBadge color="danger" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-comment-square" /> Comments
        <CBadge color="warning" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold my-2"
      >
        Settings
      </CDropdownHeader>
      <CDropdownItem> <CIcon icon="cil-user" /> Profile </CDropdownItem>
      <CDropdownItem> <CIcon icon="cil-settings" /> Settings </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-dollar" /> Payments
        <CBadge color="secondary" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-file" /> Projects
        <CBadge color="primary" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem> -->
      <CDropdownDivider />
      <CDropdownItem >
        <CButton @click="handleLogout">
          <CIcon icon="cil-lock-locked" /> Cerrar Sesión
        </CButton>
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/AuthService";
import avatar from "@/assets/images/avatars/8.jpg";

const itemsCount = 42;
const router = useRouter();
const userData = ref({
  name_user: "",
  role_user: "",
  email_user: "",
});

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name_user) {
    userData.value.name_user = user.name_user;
    userData.value.role_user = user.role;
    userData.value.email_user = user.email;
  } else {
    console.warn("No se encontró información del usuario en localStorage");
  }
});

const handleLogout = async () => {
  try {
    const response = await authService.logoutService();
    if ((response.data.success = 200)) {
      localStorage.removeItem("acces_token");
      localStorage.removeItem("user");
      console.log("Logout exitoso:", response);
      router.push("/login");
    } else {
      console.error("Error en el logout:", response.message);
    }
  } catch (error) {
    console.error("Error en la solicitud de logout:", error);
  }
};
</script>

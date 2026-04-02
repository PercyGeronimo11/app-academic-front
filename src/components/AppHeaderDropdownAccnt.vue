<template>
  <CDropdown placement="bottom-end" variant="nav-item" autoClose="outside">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <span class="me-2"><b>{{ userData.role_user }}: {{ userData.name_user }} </b>
      </span>
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>

    <CDropdownMenu class="pt-0 shadow-lg border-0 rounded-4 overflow-hidden" style="min-width: 280px;">

      <!-- Header tipo perfil -->
      <div class="d-flex align-items-center p-3 border-bottom profile-header" role="button" @click="goToProfile">
        <CAvatar :src="avatar" size="lg" class="me-3" />
        <div>
          <div class="fw-semibold">{{ userData.name_user }}</div>
          <span class="badge-role">
            {{ userData.role_user }}
          </span>
        </div>
      </div>
      <div class="px-3 py-2 d-flex align-items-center gap-2 email-select">
        <CIcon icon="cil-envelope-open" />
        <span class="email-text">{{ userData.email_user }}</span>
      </div>
      <!-- Mi perfil -->
      <CDropdownItem class="d-flex align-items-center gap-2 py-2 item-hover" @click="goToProfile" role="button">
        <CIcon icon="cil-user" />
        <span>Ver mi perfil</span>
      </CDropdownItem>

      <CDropdownDivider />

      <!-- Logout -->
      <CDropdownItem class="d-flex align-items-center gap-2 py-2 fw-semibold logout-item" @click="handleLogout"
        role="button">
        <CIcon icon="cil-lock-locked" />
        <span>Cerrar sesión</span>
      </CDropdownItem>

    </CDropdownMenu>
  </CDropdown>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/AuthService";
import avatar from "@/assets/images/avatars/8.jpg";
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider } from "@coreui/vue";

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
      localStorage.removeItem("tiempoLogin");
      console.log("Logout exitoso:", response);
      router.push("/login");
    } else {
      console.error("Error en el logout:", response.message);
    }
  } catch (error) {
    console.error("Error en la solicitud de logout:", error);
  }
};

const goToProfile = () => {
  router.push('/user/perfil')
}


</script>
<style>
.profile-header {
  cursor: pointer;
  transition: background 0.2s ease;
}

.profile-header:hover {
  background-color: rgba(161, 157, 244, 0.5);
}
.item-hover {
  transition: background 0.2s ease;
}

.item-hover:hover {
  background-color: rgba(161, 157, 244, 0.5);;
}

.badge-role {
  background: #0d6efd;
  color: white;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.logout-item {
  color: #cb2a3a;
  transition: all 0.2s ease;
}

.logout-item:hover {
  background-color: rgba(203, 23, 41, 0.8);
  color: #f1eeee;
}

.email-select {
  user-select: text;
  /* permite seleccionar */
}

.email-text {
  cursor: text;
}
</style>

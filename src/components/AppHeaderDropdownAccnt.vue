<template>
  <CDropdown placement="bottom-end" variant="nav-item" autoClose="outside">
    <CDropdownToggle class="account-toggle py-0 pe-0" :caret="false" :aria-label="`Cuenta de ${displayName}`">
      <span class="account-toggle__meta d-none d-md-flex">
        <span class="account-toggle__role">{{ userData.role_user }}</span>
        <span class="account-toggle__name">{{ displayName }}</span>
      </span>
      <span class="account-avatar" aria-hidden="true">{{ initials }}</span>
    </CDropdownToggle>

    <CDropdownMenu class="pt-0 account-menu">
      <div class="account-card" role="button" @click="goToProfile">
        <span class="account-avatar account-avatar--lg" aria-hidden="true">{{ initials }}</span>
        <div class="account-card__text">
          <div class="account-card__name">{{ displayName }}</div>
          <span class="account-card__role">{{ userData.role_user }}</span>
        </div>
      </div>

      <div class="account-email">
        <CIcon icon="cil-envelope-open" />
        <span class="account-email__text">{{ userData.email_user }}</span>
      </div>

      <CDropdownItem class="d-flex align-items-center gap-2 py-2" role="button" @click="goToProfile">
        <CIcon icon="cil-user" />
        <span>Ver mi perfil</span>
      </CDropdownItem>

      <CDropdownDivider />

      <CDropdownItem class="d-flex align-items-center gap-2 py-2 fw-semibold logout-item" role="button"
        @click="handleLogout">
        <CIcon icon="cil-lock-locked" />
        <span>Cerrar sesión</span>
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/AuthService";
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider } from "@coreui/vue";
import { getFirstName } from "@/utils/utils";
import { clearSession, getStoredUser } from "@/utils/session";

const router = useRouter();
const userData = ref({
  name: "",
  surname_father: "",
  surname_mother: "",
  role_user: "",
  email_user: "",
});

const displayName = computed(() =>
  `${getFirstName(userData.value.name)} ${userData.value.surname_father}`.trim()
);

const initials = computed(() => {
  const first = (userData.value.name || "").trim()[0] || "";
  const last = (userData.value.surname_father || "").trim()[0] || "";
  return `${first}${last}`.toUpperCase();
});

const handleLogout = async () => {
  try {
    await authService.logoutService();
  } catch (error) {
    console.error("Error en la solicitud de logout:", error);
  } finally {
    clearSession();
    router.replace({ name: "Login" });
  }
};

const goToProfile = () => {
  const role = userData.value.role_user;
  if (role === 'ESTUDIANTE') {
    router.push('/user/ver-perfil-student');
  } else if (role === 'DIRECCION' || role === 'AUXILIAR' || role === 'SECRETARIA') {
    router.push('/user/ver-perfil-admin');
  } else if (role === 'PROFESOR' || role === 'DOCENTE') {
    router.push('/user/ver-perfil-teacher');
  }
};

onMounted(() => {
  const user = getStoredUser();
  if (!user) {
    clearSession();
    router.replace({ name: "Login" });
    return;
  }

  userData.value.name = user.name ?? "";
  userData.value.surname_father = user.surname_father ?? "";
  userData.value.surname_mother = user.surname_mother ?? "";
  userData.value.role_user = user.role ?? "";
  userData.value.email_user = user.email ?? "";
});
</script>

<style scoped>
.account-toggle {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
}

.account-toggle__meta {
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
  max-width: 12rem;
}

.account-toggle__role {
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--rp-text-subtle);
}

.account-toggle__name {
  font-size: var(--rp-text-base);
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Avatar por iniciales: sin imágenes de plantilla y siempre coherente. */
.account-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-brand-500);
  color: var(--rp-text-on-brand);
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-weight-semibold);
  letter-spacing: 0.02em;
}

.account-avatar--lg {
  width: 2.75rem;
  height: 2.75rem;
  font-size: var(--rp-text-md);
}

.account-menu {
  min-width: 18rem;
  overflow: hidden;
}

.account-card {
  display: flex;
  align-items: center;
  gap: var(--rp-space-3);
  padding: var(--rp-space-4);
  border-bottom: 1px solid var(--rp-border-subtle);
  cursor: pointer;
  transition: background-color var(--rp-transition-fast);
}

.account-card:hover {
  background-color: var(--rp-surface-hover);
}

.account-card__text {
  min-width: 0;
}

.account-card__name {
  font-weight: var(--rp-weight-semibold);
  color: var(--rp-text-heading);
}

.account-card__role {
  display: inline-block;
  margin-top: var(--rp-space-1);
  padding: 0.1rem 0.5rem;
  border-radius: var(--rp-radius-pill);
  background: var(--rp-surface-brand-soft);
  color: var(--rp-text-brand);
  font-size: var(--rp-text-2xs);
  font-weight: var(--rp-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.account-email {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
  padding: var(--rp-space-2) var(--rp-space-4);
  color: var(--rp-text-muted);
  font-size: var(--rp-text-sm);
  user-select: text;
}

.account-email__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-item {
  color: var(--rp-danger-700);
}

.logout-item:hover {
  background-color: var(--rp-danger-50);
  color: var(--rp-danger-700);
}
</style>

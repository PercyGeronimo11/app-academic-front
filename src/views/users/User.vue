<template>
    <div>
      <h1>Lista de Usuarios</h1>
      <button @click="openCreateModal">Crear Usuario</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role.name }}</td>
            <td>
              <button @click="openEditModal(user)">Editar</button>
              <button @click="deleteUser(user.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Modal para Crear/Editar Usuario -->
      <div v-if="isModalOpen">
        <h2>{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
        <form @submit.prevent="isEditMode ? updateUser() : createUser()">
          <input v-model="userData.name" placeholder="Nombre" required />
          <input v-model="userData.email" placeholder="Email" type="email" required />
          <input v-model="userData.password" placeholder="Contraseña" type="password" v-if="!isEditMode" required />
          <select v-model="userData.role_id" required>
            <option v-for="role in roles" :value="role.id" :key="role.id">{{ role.name }}</option>
          </select>
          <button type="submit">{{ isEditMode ? 'Actualizar' : 'Crear' }}</button>
          <button @click="closeModal">Cancelar</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import UserService from '@/services/UserService';
  
  export default {
    data() {
      return {
        users: [],
        roles: [],
        isModalOpen: false,
        isEditMode: false,
        userData: {
          name: '',
          email: '',
          password: '',
          role_id: ''
        },
      };
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await UserService.getUsers();
          this.users = response.data;
        } catch (error) {
          console.error(error);
        }
      },
      async fetchRoles() {
        try {
          const response = await UserService.getRoles();
          this.roles = response.data;
        } catch (error) {
          console.error(error);
        }
      },
      openCreateModal() {
        this.isEditMode = false;
        this.resetForm();
        this.isModalOpen = true;
      },
      openEditModal(user) {
        this.isEditMode = true;
        this.userData = { ...user, password: '' };
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
        this.resetForm();
      },
      resetForm() {
        this.userData = {
          name: '',
          email: '',
          password: '',
          role_id: ''
        };
      },
      async createUser() {
        try {
          await UserService.createUser(this.userData);
          this.fetchUsers();
          this.closeModal();
        } catch (error) {
          console.error(error);
        }
      },
      async updateUser() {
        try {
          await UserService.updateUser(this.userData.id, this.userData);
          this.fetchUsers();
          this.closeModal();
        } catch (error) {
          console.error(error);
        }
      },
      async deleteUser(id) {
        try {
          await UserService.deleteUser(id);
          this.fetchUsers();
        } catch (error) {
          console.error(error);
        }
      }
    },
    async mounted() {
      await this.fetchUsers();
      await this.fetchRoles();
    }
  };
  </script>
  
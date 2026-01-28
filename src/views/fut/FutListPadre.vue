<template>
  <div>
    <h2>Mis Solicitudes FUT</h2>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Resumen</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fut in futs" :key="fut.id">
          <td>{{ fut.id }}</td>
          <td>{{ fut.resumen_pedido }}</td>
          <td>{{ fut.estado }}</td>
          <td>{{ fut.created_at }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import FutService from '@/services/FutService.js'

export default {
  data() {
    return {
      futs: []
    }
  },
  async mounted() {
    const res = await FutService.getMisFuts()
    this.futs = res.data
  }
}
</script>

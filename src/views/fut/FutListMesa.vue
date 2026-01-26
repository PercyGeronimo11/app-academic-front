<template>
  <div>
    <h2>Mesa de Partes - FUT Recibidos</h2>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Solicitante</th>
          <th>Resumen</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fut in futs" :key="fut.id">
          <td>{{ fut.id }}</td>
          <td>{{ fut.numero_documento }}</td>
          <td>{{ fut.resumen_pedido }}</td>
          <td>{{ fut.estado }}</td>
          <td>
            <select v-model="fut.estado" @change="actualizarEstado(fut)">
              <option>PENDIENTE</option>
              <option>APROBADO</option>
              <option>RECHAZADO</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import FutService from '@/services/futService'

export default {
  data() {
    return {
      futs: []
    }
  },
  async mounted() {
    const res = await FutService.getTodosFuts()
    this.futs = res.data
  },
  methods: {
    async actualizarEstado(fut) {
      await FutService.cambiarEstado(fut.id, fut.estado)
      alert('Estado actualizado')
    }
  }
}
</script>

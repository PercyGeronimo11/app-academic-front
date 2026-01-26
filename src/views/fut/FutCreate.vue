<template>
  <div class="container">
    <h2>Crear Solicitud FUT</h2>

    <form @submit.prevent="guardar">
      <input v-model="form.resumen_pedido" placeholder="Resumen del pedido" required />
      <input v-model="form.dependencia" placeholder="Dependencia" required />

      <select v-model="form.tipo_persona">
        <option value="NATURAL">Persona Natural</option>
        <option value="JURIDICA">Persona Jurídica</option>
      </select>

      <input v-model="form.numero_documento" placeholder="Documento" required />
      <input v-model="form.departamento" placeholder="Departamento" required />
      <input v-model="form.provincia" placeholder="Provincia" required />
      <input v-model="form.distrito" placeholder="Distrito" required />

      <textarea v-model="form.fundamentacion" placeholder="Fundamentación" required />

      <button>Enviar FUT</button>
    </form>
  </div>
</template>

<script>
import FutService from '@/services/fut.service'

export default {
  data() {
    return {
      form: {
        resumen_pedido: '',
        dependencia: '',
        tipo_persona: 'NATURAL',
        tipo_documento: 'DNI',
        numero_documento: '',
        departamento: '',
        provincia: '',
        distrito: '',
        fundamentacion: ''
      }
    }
  },
  methods: {
    async guardar() {
      await FutService.crearFut(this.form)
      alert('FUT registrado correctamente')
      this.$router.push('/mis-futs')
    }
  }
}
</script>

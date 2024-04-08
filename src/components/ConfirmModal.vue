<template>
  <div class="modal">
    <p>{{ message }}</p>
    <input v-model="password" type="password" placeholder="Reinserisci la tua password" />
    <button @click="confirm">Conferma</button>
    <button @click="$emit('cancel')">Annulla</button>
  </div>
</template>

<script>
export default {
  props: ['message'],
  emits: ['confirm', 'cancel'],
  data () {
    return {
      password: ''
    }
  },
  methods: {
    confirm () {
      this.$emit('confirm', this.password)
    }
  }
}
</script>

<!-- Aggiungi qui gli stili per la modal -->

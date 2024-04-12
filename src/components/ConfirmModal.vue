<template>
  <div class="modal">
    <p>{{ message }}</p>
    <input v-model="password" type="password" placeholder="Re-enter your password" />
    <button @click="confirm">Confirm</button>
    <button @click="$emit('cancel')">Cancel</button>
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

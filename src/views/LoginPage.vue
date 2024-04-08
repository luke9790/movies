<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
      <p>Non hai un account? <router-link to="/register">Registrati ora</router-link></p>
      <!-- Visualizzazione del messaggio di errore -->
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { auth } from '@/firebase' // Assicurati che il percorso sia corretto per il tuo file di configurazione Firebase
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'LoginPage',
  data () {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login () {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        // Se il login ha successo, puoi reindirizzare l'utente alla homepage o a un'altra pagina
        this.$router.push('/dashboard')
      } catch (error) {
        // Gestisci gli errori di login qui, ad esempio mostrando un messaggio all'utente
        this.error = error.message
        console.error('Errore di login:', error.message)
      }
    }
  }
}
</script>

  <style scoped>
  /* Stili per Login.vue */
  .error {
  color: red;
  /* Stili aggiuntivi per il messaggio di errore */
}
  </style>

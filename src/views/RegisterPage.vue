<template>
  <div class="register">
    <h1>Registrazione</h1>
    <form @submit.prevent="register">
      <input v-model="username" type="text" placeholder="Nome utente" required>
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <input v-model="firstName" type="text" placeholder="Nome">
      <input v-model="lastName" type="text" placeholder="Cognome">
      <select v-model="gender">
        <option disabled value="">Seleziona il genere</option>
        <option>Maschio</option>
        <option>Femmina</option>
        <option>Altro</option>
      </select>
      <input v-model="country" type="text" placeholder="Paese">
      <button type="submit">Registra</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>
<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/firebase' // Assicurati che il percorso sia corretto
import { doc, setDoc } from 'firebase/firestore'

export default {
  name: 'RegisterPage',
  data () {
    return {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      gender: '',
      country: '',
      error: ''
    }
  },
  methods: {
    async register () {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        // Salva i dettagli aggiuntivi dell'utente in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: this.username,
          firstName: this.firstName,
          lastName: this.lastName,
          gender: this.gender,
          country: this.country,
          email: this.email // Opzionale, se vuoi salvare l'email anche in Firestore
        })
        this.$router.push('/dashboard')
      } catch (error) {
        this.error = error.message
        console.error('Errore di registrazione:', error)
      }
    }
  }
}
</script>

  <style scoped>
  .error {
  color: red;
  }
  /* Altri stili per RegisterPage.vue */
  </style>

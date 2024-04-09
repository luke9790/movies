<template>
  <div class="dashboard">
    <h1>Preferiti</h1>
    <p>Benvenuto nella tua area riservata ai film preferiti!</p>
    <!-- Qui puoi aggiungere altre funzionalità specifiche per l'utente autenticato -->
    <FilmPreferiti :userId="userId" />
  </div>
</template>

<script>
import { auth } from '@/firebase'
import FilmPreferiti from '@/components/FilmPreferiti.vue'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, onMounted } from 'vue'

export default {
  name: 'DashboardPage',
  components: {
    FilmPreferiti
  },
  setup () {
    const userId = ref(null)

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          userId.value = user.uid
        }
      })
    })

    return { userId }
  }
}
</script>

<style scoped>
/* Stili per DashboardPage.vue */

</style>

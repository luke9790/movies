<template>
  <div id="app-container">
    <nav>
      <div class="navbar-left">
        <router-link to="/" class="navbar-logo-link">
          <img src="./assets/cinema.jpg" alt="Logo" class="navbar-logo">
        </router-link>
        <SearchBar />
        <!-- Icone/funzionalità aggiuntive -->
      </div>
      <div class="navbar-right">
        <router-link to="/" class="nav-item">Home</router-link>
        <router-link v-if="!utente" to="/login" class="nav-item">Login</router-link>
        <router-link v-if="utente" to="/dashboard" class="nav-item">Favourites</router-link>
        <router-link v-if="utente" to="/suggest-movies" class="nav-item">Suggest Movies</router-link>
        <!-- Elementi di autenticazione -->
        <router-link v-if="!utente" to="/register" class="nav-item login-link">Sign Up</router-link>
        <!-- Modifica qui per l'accesso alla pagina del profilo -->
        <router-link v-if="utente" to="/profile" class="nav-item user-info">
          {{ utente.displayName || 'Account' }}
        </router-link>
      </div>
    </nav>
    <div class="content">
    <router-view/>
    </div>
    <div class="footer">
      <p>© 2024 CinemaWorld. Tutti i diritti riservati.</p>
    </div>
</div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import SearchBar from './components/SearchBar.vue' // Assicurati che il percorso sia corretto

export default {
  components: {
    SearchBar
  },
  setup () {
    const utente = ref(null)

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        utente.value = user
      })
    })

    return { utente }
  }
}
</script>

<style>
/* Stili globali */

</style>

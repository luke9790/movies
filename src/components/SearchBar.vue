<template>
  <div class="search-container">
    <input v-model="termineDiRicerca" placeholder="Search for a movie..." @input="cercaFilm" class="search-bar">
    <div class="suggestions-container" v-if="risultatiRicerca.length">
      <div
        class="film-suggestion"
        v-for="film in risultatiRicerca.slice(0, 5)"
        :key="film.id"
        @click="selezionaFilm(film.id)"
      >
        <img :src="`https://image.tmdb.org/t/p/w92${film.poster_path}`" :alt="film.title" class="film-suggestion-poster">
        <div class="film-suggestion-title">{{ film.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup () {
    const termineDiRicerca = ref('')
    const risultatiRicerca = ref([])
    const router = useRouter()

    const cercaFilm = async () => {
      if (termineDiRicerca.value.length > 2) {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.VUE_APP_TMDB_API_KEY}&query=${encodeURIComponent(termineDiRicerca.value)}`)
        const data = await response.json()
        risultatiRicerca.value = data.results
      } else {
        risultatiRicerca.value = []
      }
    }

    const selezionaFilm = (id) => {
      router.push({ name: 'MovieDetail', params: { id } }).then(() => {
        risultatiRicerca.value = [] // Reset dei suggerimenti dopo la navigazione
        termineDiRicerca.value = ''
      })
    }

    return { termineDiRicerca, risultatiRicerca, cercaFilm, selezionaFilm }
  }
}
</script>

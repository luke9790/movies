<template>
  <div class="suggested-movies-page">
    <h1>Film Suggeriti</h1>
    <!-- Sezione per i generi preferiti -->
    <div v-if="filmSuggeritiPerGenere">
      <h2>In base ai tuoi generi preferiti:</h2>
      <div class="suggested-grid">
        <div v-for="(film) in filmSuggeritiPerGenere.slice(0, 10)" :key="film.id" class="suggested-item" @click="vaiADettagliFilm(film.id)">
          <img v-if="film.poster_path" :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`" alt="Poster del film" class="suggested-poster">
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
    <!-- Sezione per i film più recenti con alta valutazione -->
    <div v-if="filmRecentiConAltaValutazione">
      <h2>Film recenti con valutazione alta:</h2>
      <div class="suggested-grid">
        <div v-for="(film) in filmRecentiConAltaValutazione.slice(0, 10)" :key="film.id" class="suggested-item" @click="vaiADettagliFilm(film.id)">
          <img v-if="film.poster_path" :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`" alt="Poster del film" class="suggested-poster">
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
    <!-- Sezione per i film suggeriti in base agli attori preferiti -->
    <div v-if="filmSuggeritiPerAttore">
      <h2>In base agli attori che ti piacciono:</h2>
      <div class="suggested-grid">
        <div v-for="(film) in filmSuggeritiPerAttore.slice(0, 10)" :key="film.id" class="suggested-item" @click="vaiADettagliFilm(film.id)">
          <img v-if="film.poster_path" :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`" alt="Poster del film" class="suggested-poster">
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db, auth } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'FilmSuggeriti',
  setup () {
    const filmSuggeritiPerGenere = ref([])
    const filmSuggeritiPerAttore = ref([])
    const filmRecentiConAltaValutazione = ref([])
    const router = useRouter()

    onMounted(async () => {
      const user = auth.currentUser
      if (!user) return
      const userRef = doc(db, 'utenti', user.uid)
      const docSnap = await getDoc(userRef)
      if (!docSnap.exists() || !docSnap.data().preferiti) return

      const preferiti = docSnap.data().preferiti
      const { generiPreferiti, attoriPreferiti, filmRecentiBuoni } = estraiPreferenze(preferiti)

      await caricaFilmSuggeritiPerGenere(generiPreferiti)
      await caricaFilmSuggeritiPerAttore(attoriPreferiti)
      await caricaFilmRecentiConAltaValutazione(filmRecentiBuoni)
    })

    function vaiADettagliFilm (filmId) {
      router.push({ name: 'MovieDetail', params: { id: filmId } })
    }
    function estraiPreferenze (preferiti) {
      let generiPreferiti = new Set()
      let attoriPreferiti = new Set()

      preferiti.forEach(film => {
        (film.genre_ids || []).forEach(genre => generiPreferiti.add(genre));
        (film.actors || []).forEach(actor => attoriPreferiti.add(actor.id))
      })

      generiPreferiti = Array.from(generiPreferiti)
      attoriPreferiti = Array.from(attoriPreferiti)

      return { generiPreferiti, attoriPreferiti }
    }

    async function caricaFilmSuggeritiPerGenere (generiPreferiti) {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY
      let risultati = []

      for (const genere of generiPreferiti) {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genere}`)
        if (!response.ok) {
          console.error('Errore nel recuperare i film per genere')
          continue // Continua con il prossimo genere in caso di errore
        }
        const data = await response.json()
        risultati = risultati.concat(data.results)
      }

      // Filtrare i duplicati
      filmSuggeritiPerGenere.value = [...new Map(risultati.map(item => [item.id, item])).values()]
    }

    async function caricaFilmSuggeritiPerAttore (attoriPreferiti) {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY
      let risultati = []

      // Esempio: cicla su un array di ID attore e recupera i film per ciascuno
      for (const attoreId of attoriPreferiti) {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_cast=${attoreId}`)
        if (!response.ok) {
          console.error('Errore nel recuperare i film per attore')
          continue // Continua con il prossimo attore in caso di errore
        }
        const data = await response.json()
        risultati = risultati.concat(data.results)
      }

      // Filtrare i duplicati
      filmSuggeritiPerAttore.value = [...new Map(risultati.map(item => [item.id, item])).values()]
    }

    async function caricaFilmRecentiConAltaValutazione () {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY
      // Es. richiesta per i film dal 2020 in poi con valutazione superiore a 8
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_date.gte=2020-01-01&vote_average.gte=8&sort_by=release_date.desc`)
      if (!response.ok) {
        console.error('Errore nel recuperare i film recenti con alta valutazione')
        return
      }
      const data = await response.json()
      filmRecentiConAltaValutazione.value = data.results
    }

    return {
      filmSuggeritiPerGenere,
      filmSuggeritiPerAttore,
      vaiADettagliFilm
    }
  }
}
</script>

<style>
.suggested-movies-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suggested-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  max-width: 1040px; /* Larghezza massima della griglia per contenere 5 elementi per riga con i gap */
}

.suggested-item {
  width: calc(20% - 16px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Aggiunge una transizione morbida per trasformazione e ombra */
}

.suggested-item:hover {
  transform: scale(1.05); /* Aumenta leggermente la dimensione al passaggio del mouse */
  box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* Aggiunge un'ombra per l'evidenziazione */
}

.suggested-poster {
  width: 100%;
  border-radius: 5px;
  margin-bottom: 10px; /* Spazio tra l'immagine e il titolo */
}

h2 {
  text-align: center; /* Assicura che il titolo sia centrato */
  font-size: 16px; /* Adegua la dimensione del font se necessario */
}

</style>

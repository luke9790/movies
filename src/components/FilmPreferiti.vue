<template>
  <div>
    <h3>Aggiungi ai Preferiti</h3>
    <input v-model="termineDiRicerca" placeholder="Cerca Film">
    <div class="film-grid">
      <!-- Sezione per l'aggiunta ai preferiti -->
    </div>
    <h3>Film Preferiti</h3>
    <div class="preferiti-grid">
      <div v-for="film in filmPreferiti" :key="film.id || film" class="film-card" @click="vaiADettagliFilm(film.id)">
        <img v-if="film.poster_path" :src="`https://image.tmdb.org/t/p/w200${film.poster_path}`" alt="Poster del film" class="film-image">
        <div class="film-title">{{ film.title || film }}</div>
        <button @click.stop="rimuoviPreferito(film)">Rimuovi</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { ref, onMounted, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FilmPreferiti',
  props: ['userId'],
  setup (props) {
    const filmPreferiti = ref([])
    const termineDiRicerca = ref('')
    const risultatiRicerca = ref([])
    const API_URL = 'https://api.themoviedb.org/3'
    const API_KEY = process.env.VUE_APP_TMDB_API_KEY
    const router = useRouter()

    const vaiADettagliFilm = (idFilm) => {
      router.push({ name: 'MovieDetail', params: { id: idFilm } })
    }

    const caricaPreferiti = async () => {
      if (!props.userId) return
      const filmRef = doc(db, 'utenti', props.userId)
      const docSnap = await getDoc(filmRef)
      if (docSnap.exists()) {
        filmPreferiti.value = docSnap.data().preferiti || []
      }
    }

    const cercaFilm = async (query) => {
      if (query.length > 2) { // Inizia la ricerca con almeno 3 caratteri
        const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
        const data = await response.json()
        risultatiRicerca.value = data.results // o un sottoinsieme dei risultati, a seconda delle tue necessità
      } else {
        risultatiRicerca.value = []
      }
    }

    watch(termineDiRicerca, cercaFilm)

    watchEffect(() => {
      if (props.userId) {
        caricaPreferiti()
      }
    })

    const aggiungiPreferito = async (film) => {
      const nuovoPreferito = {
        id: film.id,
        title: film.title,
        poster_path: film.poster_path // Salva anche il percorso del poster
      }

      const filmRef = doc(db, 'utenti', props.userId)
      const docSnap = await getDoc(filmRef)

      if (!docSnap.exists()) {
        await setDoc(filmRef, { preferiti: [nuovoPreferito] })
      } else {
        await updateDoc(filmRef, {
          preferiti: arrayUnion(nuovoPreferito)
        })
      }
      caricaPreferiti() // Aggiorna la lista dei preferiti
      termineDiRicerca.value = ''
    }

    const rimuoviPreferito = async (film) => {
      const filmRef = doc(db, 'utenti', props.userId)

      await updateDoc(filmRef, {
        preferiti: arrayRemove({
          id: film.id,
          title: film.title,
          poster_path: film.poster_path
        })
      })
      caricaPreferiti() // Aggiorna la lista dei preferiti dopo la rimozione
    }

    onMounted(caricaPreferiti)

    return { termineDiRicerca, risultatiRicerca, filmPreferiti, aggiungiPreferito, vaiADettagliFilm, rimuoviPreferito }
  }
}
</script>

<style scoped>
.film-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* Spazio ridotto tra le carte */
}

.preferiti-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centra gli elementi orizzontalmente */
  gap: 12px;
  margin-top: 20px;
}

.film-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Distribuisce i contenuti equamente */
  width: 150px;
  min-height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
}

.film-card:hover {
  transform: scale(1.05); /* Leggero ingrandimento al hover */
  box-shadow: 0 4px 8px rgba(0,0,0,0.2); /* Aggiungi un'ombra per dare profondità */
}

.film-card button {
  padding: 6px 12px;
  background-color: #ff4545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.film-card button:hover {
  background-color: #941818; /* Colore leggermente più scuro al passaggio del mouse */
}

.film-image {
  width: 100%;
  height: 180px; /* Altezza fissa per l'immagine */
  object-fit: cover; /* Mantiene le proporzioni dell'immagine */
  margin-bottom: 5px;
}

.film-title {
  font-size: 16px;
  text-align: center;
}

</style>

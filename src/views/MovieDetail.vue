<template>
  <div v-if="movie" class="movie-detail-container">
    <img :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''" :alt="movie.title" class="movie-poster">
    <div class="movie-info">
      <h1>{{ movie.title }}</h1>
      <p class="release-date"><strong>Release date:</strong> {{ movie.release_date }}</p>
      <p class="duration"><strong>Duration:</strong> {{ movie.runtime }} minutes</p>
      <p class="genres"><strong>Genre:</strong> {{ movie.genres ? movie.genres.map(genre => genre.name).join(', ') : 'Generi non disponibili' }}</p>
      <p class="overview"><strong>Overview:</strong> {{ movie.overview }}</p>

      <!-- Sezione Regista (aggiornata per mostrare solo il nome cliccabile) -->
      <div v-if="movie.director && movie.director.name">
        <strong>Director:</strong>
        <p @click="goToDirectorDetails(movie.director.id)" class="clickable-name">{{ movie.director.name }}</p>
      </div>

      <!-- Sezione Cast (rimane invariata) -->
      <div class="cast">
        <strong>Cast:</strong>
        <div class="cast-list">
          <div v-for="actor in movie.cast.slice(0, 5)" :key="actor.cast_id" @click="goToActorDetails(actor.id)" class="cast-member">
            <img :src="actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/path/to/default/image'" :alt="actor.name" class="cast-photo">
            <div class="cast-name">{{ actor.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    Caricamento dettagli del film...
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const route = useRoute()
    const router = useRouter()
    const movie = ref(null)

    const fetchMovie = async () => {
      try {
        // Recupera i dettagli del film
        const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${props.id}?api_key=${process.env.VUE_APP_TMDB_API_KEY}`)
        if (!movieResponse.ok) throw new Error('Errore nel recupero dei dettagli del film')
        const movieData = await movieResponse.json()

        // Recupera i dettagli del cast
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/movie/${props.id}/credits?api_key=${process.env.VUE_APP_TMDB_API_KEY}`)
        if (!creditsResponse.ok) throw new Error('Errore nel recupero dei dettagli del cast')
        const creditsData = await creditsResponse.json()

        // Estrai regista, sceneggiatore e direttore della fotografia dal crew
        const director = creditsData.crew.find(member => member.job === 'Director')

        // Combina i dati in un unico oggetto movie
        movie.value = {
          ...movieData,
          cast: creditsData.cast,
          director: director ? { id: director.id, name: director.name } : null
        }
      } catch (error) {
        console.error(error.message)
      }
    }

    const goToActorDetails = (actorId) => {
      router.push({ name: 'ActorDetail', params: { id: actorId } })
    }

    const goToDirectorDetails = directorId => {
      router.push({ name: 'DirectorDetail', params: { id: directorId } })
    }

    onMounted(fetchMovie)

    // Watcher sui cambiamenti dell'ID del film nella route
    watch(() => route.params.id, (newId) => {
      fetchMovie(newId)
    })

    return {
      movie,
      goToActorDetails,
      goToDirectorDetails
    }
  }
}
</script>

<style scoped>
.movie-detail-container{
  margin: 50px;
  min-height: 65vh;
}
img {
  max-height: 100%;
}
.clickable-name {
  cursor: pointer;
  color: #007bff; /* O il colore che preferisci per i link */
  text-decoration: underline;
}
.cast-member, .clickable-name {
  /* Aggiungi lo stile per il hover per migliorare l'interattività */
  transition: transform 0.2s;
}
.cast-member:hover, .clickable-name:hover {
  color: #0056b3; /* Rende il colore un po' più scuro al passaggio del mouse */
}
.cast-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Distanza tra le schede */
}

.cast-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px; /* Larghezza delle schede del cast */
  transition: transform 0.2s;
}
.cast-member:hover {
  transform: scale(1.05); /* Leggero zoom quando il mouse passa sopra */
  cursor: pointer;
}

.cast-photo {
  width: 100%; /* Adatta la foto alla larghezza della scheda */
  border-radius: 5px; /* Bordi arrotondati per la foto */
  margin-bottom: 5px;
}

.cast-name {
  font-size: 14px;
  text-align: center;
  transition: color 0.2s ease;
}

.cast-member:hover .cast-name {
  color: #0056b3; /* Cambia il colore del nome al passaggio del mouse */
}
</style>

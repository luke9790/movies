<template>
  <div v-if="director" class="director-detail-container">
    <div class="director-info">
      <h1>{{ director.name }}</h1>
      <!-- Informazioni addizionali sul regista se disponibili -->
      <p><strong>Birthday:</strong> {{ director.birthday }}</p>
      <p><strong>Place of Birth:</strong> {{ director.place_of_birth }}</p>
      <p><strong>Biography:</strong> {{ director.biography }}</p>
    </div>
    <!-- Lista dei film diretti -->
    <div class="director-movies">
      <h2>Movies Directed</h2>
      <div class="movies-list">
        <div v-for="movie in director.movies" :key="movie.id" @click="goToMovieDetails(movie.id)" class="movie-item">
          <img :src="movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : '/path/to/default/image'" alt="movie.title" class="movie-poster">
          <div class="movie-title">{{ movie.title }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Loading director details...</div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  setup () {
    const route = useRoute()
    const router = useRouter()
    const director = ref(null)

    const fetchDirectorDetails = async () => {
      // Sostituisci con la tua chiamata API per ottenere i dettagli del regista e i film diretti
      const response = await fetch(`https://api.themoviedb.org/3/person/${route.params.id}?api_key=${process.env.VUE_APP_TMDB_API_KEY}&append_to_response=movie_credits`)
      const data = await response.json()
      const directedMovies = data.movie_credits.crew.filter(credit => credit.job === 'Director')
      director.value = {
        ...data,
        // Presumi che `directed_movies` sia incluso nella risposta
        movies: directedMovies
      }
    }

    const goToMovieDetails = (movieId) => {
      router.push({ name: 'MovieDetail', params: { id: movieId } })
    }

    onMounted(fetchDirectorDetails)

    return {
      director,
      goToMovieDetails
    }
  }
}
</script>

<style scoped>
.director-detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

.director-info {
  margin-bottom: 20px;
}

.movies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.movie-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.movie-poster {
  width: 100px;
  border-radius: 5px;
}

.movie-title {
  text-align: center;
  margin-top: 5px;
}
</style>

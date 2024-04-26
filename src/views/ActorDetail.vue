<template>
  <div v-if="actor" class="actor-detail-page">
    <div class="actor-detail-container">
      <div class="actor-image-container">
        <img
          :src="
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
              : '/path/to/default/image'
          "
          :alt="actor.name"
          class="actor-image"
        />
      </div>
      <div class="actor-info-container">
        <h1>{{ actor.name }}</h1>
        <p><strong>Birthday:</strong> {{ actor.birthday }}</p>
        <p><strong>Place of Birth:</strong> {{ actor.place_of_birth }}</p>
        <p><strong>Biography:</strong> {{ actor.biography }}</p>
      </div>
    </div>
    <div class="actor-movies-container">
      <h2>Movies</h2>
      <div class="movies-list">
        <div
          v-for="movie in actor.movies"
          :key="movie.id"
          class="movie-item"
          @click="goToMovieDetails(movie.id)"
        >
          <img
            :src="
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                : '/path/to/default/image'
            "
            :alt="movie.title"
            class="movie-poster"
          />
          <div class="movie-title">{{ movie.title }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Loading actor details...</div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const actor = ref(null);

    const fetchActorDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${route.params.id}?api_key=${process.env.VUE_APP_TMDB_API_KEY}&append_to_response=movie_credits`
        );
        if (!response.ok) throw new Error("Failed to fetch actor details");
        const data = await response.json();

        actor.value = {
          ...data,
          movies: data.movie_credits.cast, // Presumi che `movie_credits` sia incluso nella risposta
        };
      } catch (error) {}
    };

    const goToMovieDetails = (movieId) => {
      router.push({ name: "MovieDetail", params: { id: movieId } });
    };

    onMounted(fetchActorDetails);

    return {
      actor,
      goToMovieDetails,
    };
  },
};
</script>
<style scoped>
.actor-detail-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px;
}

.actor-detail-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
}

.actor-image-container {
  margin-right: 20px;
  margin-top: 30px;
}

.actor-image {
  width: 200px;
  height: auto;
  border-radius: 10px;
}

.actor-info-container {
  display: flex;
  flex-direction: column;
}

.actor-movies-container {
  width: 100%;
}

.movies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.movie-item {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s;
}

.movie-item:hover {
  transform: scale(1.1);
}

.movie-poster {
  width: 100%;
  border-radius: 5px;
}

.movie-title {
  text-align: center;
  margin-top: 5px;
}
</style>

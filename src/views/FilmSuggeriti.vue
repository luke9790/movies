<template>
  <div class="suggested-movies-page">
    <h1>Suggested Movies</h1>
    <!-- Sezione per i generi preferiti -->
    <div v-if="filmSuggeritiPerGenere">
      <h2>Based on your genres</h2>
      <div class="suggested-grid">
        <div
          v-for="film in filmSuggeritiPerGenere.slice(0, 10)"
          :key="film.id"
          class="suggested-item"
          @click="vaiADettagliFilm(film.id)"
        >
          <img
            v-if="film.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`"
            alt="Poster del film"
            class="suggested-poster"
          />
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
    <!-- Sezione per i film più recenti con alta valutazione -->
    <div v-if="filmRecentiConAltaValutazione">
      <h2>Based on recent movies:</h2>
      <div class="suggested-grid">
        <div
          v-for="film in filmRecentiConAltaValutazione.slice(0, 10)"
          :key="film.id"
          class="suggested-item"
          @click="vaiADettagliFilm(film.id)"
        >
          <img
            v-if="film.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`"
            alt="Poster del film"
            class="suggested-poster"
          />
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
    <!-- Sezione per i film suggeriti in base agli attori preferiti -->
    <div v-if="filmSuggeritiPerAttore">
      <h2>Based on your favourites actors:</h2>
      <div class="suggested-grid">
        <div
          v-for="film in filmSuggeritiPerAttore.slice(0, 10)"
          :key="film.id"
          class="suggested-item"
          @click="vaiADettagliFilm(film.id)"
        >
          <img
            v-if="film.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${film.poster_path}`"
            alt="Poster del film"
            class="suggested-poster"
          />
          <h2>{{ film.title }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db, auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export default {
  name: "FilmSuggeriti",
  setup() {
    const filmSuggeritiPerGenere = ref([]);
    const filmSuggeritiPerAttore = ref([]);
    const filmRecentiConAltaValutazione = ref([]);
    const filmSuggeritiIds = ref(new Set());
    const router = useRouter();

    onMounted(async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, "utenti", user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists() || !docSnap.data().preferiti) return;

      const preferiti = docSnap.data().preferiti;
      const preferitiIds = preferiti.map((film) => film.id);
      const { generiPreferiti, attoriPreferiti } = estraiPreferenze(preferiti);

      await caricaFilmSuggeritiPerGenere(
        generiPreferiti,
        preferitiIds,
        filmSuggeritiIds
      );
      await caricaFilmSuggeritiPerAttore(attoriPreferiti, filmSuggeritiIds);
      await caricaFilmRecentiConAltaValutazione(filmSuggeritiIds);
    });

    function vaiADettagliFilm(filmId) {
      router.push({ name: "MovieDetail", params: { id: filmId } });
    }
    function estraiPreferenze(preferiti) {
      let generiPreferiti = new Set();
      let attoriPreferiti = new Set();

      preferiti.forEach((film) => {
        (film.genre_ids || []).forEach((genre) => generiPreferiti.add(genre));
        (film.actors || []).forEach((actor) => attoriPreferiti.add(actor.id));
      });

      generiPreferiti = Array.from(generiPreferiti);
      attoriPreferiti = Array.from(attoriPreferiti);

      return { generiPreferiti, attoriPreferiti };
    }

    async function caricaFilmSuggeritiPerGenere(
      generiPreferiti,
      preferitiIds,
      filmSuggeritiIds
    ) {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY;
      let risultati = [];

      for (const genere of generiPreferiti) {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genere}&vote_average.gte=8`
        );
        if (!response.ok) {
          continue; // Continua con il prossimo genere in caso di errore
        }
        const data = await response.json();
        const filmValidi = data.results.filter(
          (film) =>
            !preferitiIds.includes(film.id) &&
            !filmSuggeritiIds.value.has(film.id)
        );
        filmValidi.forEach((film) => filmSuggeritiIds.value.add(film.id));
        risultati = risultati.concat(filmValidi);
      }

      // Filtrare i duplicati
      filmSuggeritiPerGenere.value = [
        ...new Map(risultati.map((item) => [item.id, item])).values(),
      ];
    }

    async function caricaFilmSuggeritiPerAttore(
      attoriPreferiti,
      filmSuggeritiIds
    ) {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY;
      let risultati = [];

      for (const attoreId of attoriPreferiti) {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_cast=${attoreId}`
        );
        if (!response.ok) {
          continue;
        }
        const data = await response.json();
        const filmValidi = data.results.filter(
          (film) => !filmSuggeritiIds.value.has(film.id)
        );
        filmValidi.forEach((film) => filmSuggeritiIds.value.add(film.id));
        risultati = risultati.concat(filmValidi);
      }

      filmSuggeritiPerAttore.value = [
        ...new Map(risultati.map((item) => [item.id, item])).values(),
      ];
    }

    async function caricaFilmRecentiConAltaValutazione(filmSuggeritiIds) {
      const API_KEY = process.env.VUE_APP_TMDB_API_KEY;
      const risultati = [];
      let pagina = 1;
      const numeroDesiderato = 10;
      while (risultati.length < numeroDesiderato) {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_date.gte=2020-01-01&vote_average.gte=8&vote_count.gte=100&with_runtime.gte=80&sort_by=popularity.desc&page=${pagina}`
        );
        if (!response.ok) {
          break;
        }
        const data = await response.json();
        const filmValidi = data.results.filter(
          (film) => !filmSuggeritiIds.value.has(film.id)
        );
        filmValidi.forEach((film) => {
          if (risultati.length < numeroDesiderato) {
            filmSuggeritiIds.value.add(film.id);
            risultati.push(film);
          }
        });
        pagina++; // Passa alla pagina successiva dei risultati
        if (pagina > data.total_pages) break; // Esce dal ciclo se non ci sono più pagine disponibili
      }

      filmRecentiConAltaValutazione.value = risultati;
    }

    return {
      filmSuggeritiPerGenere,
      filmSuggeritiPerAttore,
      filmRecentiConAltaValutazione,
      vaiADettagliFilm,
    };
  },
};
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
  transform: scale(
    1.05
  ); /* Aumenta leggermente la dimensione al passaggio del mouse */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Aggiunge un'ombra per l'evidenziazione */
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

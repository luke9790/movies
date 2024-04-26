<template>
  <div>
    <h3>Add to favourites</h3>
    <input
      v-model="termineDiRicerca"
      placeholder="Search a movie"
      @input="cercaFilm"
    />
    <div class="film-grid">
      <div
        v-for="film in risultatiRicerca.slice(0, 5)"
        :key="film.id"
        class="film-card"
        @click="aggiungiPreferito(film)"
      >
        <img
          v-if="film.poster_path"
          :src="`https://image.tmdb.org/t/p/w200${film.poster_path}`"
          alt="Poster del film"
        />
        <div class="film-title">{{ film.title }}</div>
      </div>
    </div>
    <h3>Favourites Movies</h3>
    <div class="preferiti-grid">
      <div
        v-for="film in filmPreferiti"
        :key="film.id || film"
        class="film-card"
        @click="vaiADettagliFilm(film.id)"
      >
        <img
          v-if="film.poster_path"
          :src="`https://image.tmdb.org/t/p/w200${film.poster_path}`"
          alt="Poster del film"
          class="film-image"
        />
        <div class="film-title">{{ film.title || film }}</div>
        <button @click.stop="rimuoviPreferito(film)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, onMounted, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "FilmPreferiti",
  props: ["userId"],
  setup(props) {
    const filmPreferiti = ref([]);
    const termineDiRicerca = ref("");
    const risultatiRicerca = ref([]);
    const API_URL = "https://api.themoviedb.org/3";
    const API_KEY = process.env.VUE_APP_TMDB_API_KEY;
    const router = useRouter();

    const vaiADettagliFilm = (idFilm) => {
      router.push({ name: "MovieDetail", params: { id: idFilm } });
    };

    const caricaPreferiti = async () => {
      if (!props.userId) return;
      const filmRef = doc(db, "utenti", props.userId);
      const docSnap = await getDoc(filmRef);
      if (docSnap.exists()) {
        filmPreferiti.value = docSnap.data().preferiti || [];
      }
    };

    const cercaFilm = async (query) => {
      if (query.length > 2) {
        // Inizia la ricerca con almeno 3 caratteri
        const response = await fetch(
          `${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        risultatiRicerca.value = data.results; // o un sottoinsieme dei risultati, a seconda delle tue necessità
      } else {
        risultatiRicerca.value = [];
      }
    };

    watch(termineDiRicerca, cercaFilm);

    watchEffect(() => {
      if (props.userId) {
        caricaPreferiti();
      }
    });

    // Esempio di funzione per ottenere i dettagli del film
    const fetchDettagliFilm = async (filmId) => {
      const response = await fetch(
        `${API_URL}/movie/${filmId}?api_key=${API_KEY}&append_to_response=credits`
      );
      const data = await response.json();
      return {
        genres: data.genres, // Restituisce l'array completo degli oggetti genere
        director:
          data.credits.crew.find((person) => person.job === "Director")?.name ||
          "",
        actors: data.credits.cast
          .slice(0, 3)
          .map((actor) => ({ name: actor.name, id: actor.id })), // Assicurati che questa struttura dati corrisponda a ciò che ti aspetti
      };
    };

    const aggiungiPreferito = async (film) => {
      // Ottieni i dettagli del film, inclusi generi, regista e attori principali
      const dettagliFilm = await fetchDettagliFilm(film.id);
      // Assicurati che tutti i campi richiesti siano definiti
      if (
        !dettagliFilm.genres ||
        !dettagliFilm.director ||
        dettagliFilm.actors.some((actor) => actor === undefined)
      ) {
        return; // Impedisci l'aggiunta del film ai preferiti se mancano dettagli
      }
      const nuovoPreferito = {
        id: film.id,
        title: film.title,
        poster_path: film.poster_path || [], // Salva anche il percorso del poster
        genre_ids: dettagliFilm.genres.map((genre) => genre.id) || [], // ID dei generi
        director: dettagliFilm.director || "Sconosciuto", // Nome del regista
        actors: dettagliFilm.actors.map((actor) => actor.name) || [], // Nomi degli attori principali
      };
      const filmRef = doc(db, "utenti", props.userId);
      const docSnap = await getDoc(filmRef);

      if (!docSnap.exists()) {
        await setDoc(filmRef, { preferiti: [nuovoPreferito] });
      } else {
        await updateDoc(filmRef, {
          preferiti: arrayUnion(nuovoPreferito),
        });
      }
      caricaPreferiti(); // Aggiorna la lista dei preferiti
      termineDiRicerca.value = "";
    };

    const rimuoviPreferito = async (film) => {
      const filmRef = doc(db, "utenti", props.userId);
      const docSnap = await getDoc(filmRef);

      if (docSnap.exists()) {
        // Recupera l'attuale lista dei preferiti
        let preferitiAttuali = docSnap.data().preferiti || [];

        // Rimuove il film dall'array basandosi sull'ID
        preferitiAttuali = preferitiAttuali.filter((f) => f.id !== film.id);

        // Aggiorna l'elenco dei preferiti in Firestore
        await updateDoc(filmRef, { preferiti: preferitiAttuali });

        // Aggiorna l'elenco dei preferiti nell'UI
        filmPreferiti.value = preferitiAttuali;
      }
    };

    onMounted(caricaPreferiti);

    return {
      termineDiRicerca,
      risultatiRicerca,
      filmPreferiti,
      aggiungiPreferito,
      vaiADettagliFilm,
      rimuoviPreferito,
    };
  },
};
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Aggiungi un'ombra per dare profondità */
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
firebase

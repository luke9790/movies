<template>
  <div class="edit-profile-container">
    <div class="edit-profile">
      <h1>Edit Profile</h1>
      <form @submit.prevent="updateProfile">
        <div>
          <label for="username">Username:</label>
          <input id="username" v-model="user.username" />
        </div>
        <div>
          <label for="firstName">Name:</label>
          <input id="firstName" v-model="user.firstName" />
        </div>
        <div>
          <label for="lastName">Surname:</label>
          <input id="lastName" v-model="user.lastName" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input id="email" v-model="user.email" type="email" />
        </div>
        <div>
          <label for="gender">Gender:</label>
          <select id="gender" v-model="user.gender">
            <option value="">Select an option</option>
            <option value="maschio">Male</option>
            <option value="femmina">Female</option>
            <option value="altro">Other</option>
          </select>
        </div>
        <div>
          <label for="country">Country:</label>
          <input id="country" v-model="user.country" />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "@firebase/firestore";

export default {
  setup() {
    const user = ref({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      country: "",
    });

    onMounted(async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          user.value = { ...docSnap.data() };
        }
      }
    });

    const updateProfile = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { ...user.value });
      alert("Profilo aggiornato con successo!");
      // Qui puoi anche reindirizzare l'utente alla pagina el profilo
    };

    return { user, updateProfile };
  },
};
</script>

<style>
.edit-profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e5e5e6; /* O un colore di sfondo a tua scelta */
}

.edit-profile {
  max-width: 600px;
  margin: 20px;
  padding: 20px 40px;
  background-color: rgba(0, 0, 0, 0.418); /* Sfondo semi-trasparente */
  border-radius: 8px; /* Angoli arrotondati */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Ombra per dare profondità */
}

.edit-profile form div {
  margin-bottom: 20px;
}

.edit-profile form label {
  display: block;
  margin-bottom: 8px; /* Aumenta lo spazio sotto le etichette */
  color: #fff; /* Colore del testo bianco */
  font-size: 18px; /* Dimensione del testo più grande */
}

/* Applica gli stili sia agli input che ai select per uniformità */
.edit-profile form input,
.edit-profile form select {
  width: 100%; /* Assicura che occupino l'intera larghezza del contenitore */
  padding: 8px; /* Padding interno per maggiore leggibilità */
  border: 1px solid #ccc; /* Bordo per distinguere chiaramente il campo */
  border-radius: 4px; /* Angoli arrotondati per un aspetto più morbido */
  box-sizing: border-box; /* Assicura che padding e border siano inclusi nella larghezza */
  background: rgba(255, 255, 255, 0.9); /* Sfondo leggermente trasparente */
  color: #000;
}

.edit-profile form button {
  /* Stili per il bottone, personalizza come preferisci */
  background-color: #4caf50; /* Colore di esempio per il bottone */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-profile form button:hover {
  background-color: #45a049; /* Colore al passaggio del mouse */
}
</style>
firebase firebase

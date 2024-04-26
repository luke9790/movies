<template>
  <div class="user-profile">
    <h1>User Profile</h1>
    <p><strong>Username:</strong> {{ username }}</p>
    <p><strong>Email:</strong> {{ email }}</p>
    <p><strong>Name:</strong> {{ firstName }}</p>
    <p><strong>Surname:</strong> {{ lastName }}</p>
    <p><strong>Gender:</strong> {{ gender }}</p>
    <p><strong>Country:</strong> {{ country }}</p>

    <!-- Pulsanti per la modifica e la cancellazione del profilo -->
    <button @click="startEdit">Edit profile</button>
    <button @click="logout">Logout</button>
    <button @click="showConfirmModal = true">Delete Account</button>
    <!-- ConfirmModal viene visualizzata quando showConfirmModal è true -->
    <ConfirmModal
      v-if="showConfirmModal"
      message="Are you sure you want to delete your account? This action is irreversible. Please re-enter your password to confirm."
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- Mostra un messaggio di errore se presente -->
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { useRouter } from "vue-router";
import ConfirmModal from "../components/ConfirmModal.vue";

export default {
  components: { ConfirmModal },
  setup() {
    const error = ref("");
    const displayName = ref("");
    const email = ref("");
    const username = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const gender = ref("");
    const country = ref("");
    const router = useRouter();
    const showConfirmModal = ref(false);

    const logout = () => {
      signOut(auth)
        .then(() => {
          // Reindirizza l'utente alla pagina di login dopo il logout
          router.push("/login");
        })
        .catch((error) => {
          // Gestisci eventuali errori durante il logout
        });
    };

    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          // Imposta i valori dei dati utente
          const userData = docSnap.data();
          username.value = userData.username || "Not specified";
          firstName.value = userData.firstName || "Not specified";
          lastName.value = userData.lastName || "Not specified";
          gender.value = userData.gender || "Not specified";
          country.value = userData.country || "Not specified";
          // Email e displayName sono già disponibili tramite auth.currentUser
          email.value = auth.currentUser.email;
          displayName.value = auth.currentUser.displayName || username.value; // Usa username se displayName non è disponibile
        } else {
        }
      }
    };

    const deleteAccount = async () => {
      try {
        await deleteUser(auth.currentUser);
        // Aggiungi qui il codice per gestire ciò che succede dopo la cancellazione dell'account, ad esempio:
        // Reindirizzare l'utente alla pagina di login o alla homepage
        router.push("/login");
      } catch (error) {}
    };

    const startEdit = () => {
      // Esempio: navigazione a una pagina di modifica del profilo
      // Assicurati di avere definito una route per '/edit-profile' nel tuo router
      router.push("/edit-profile");
    };

    const handleConfirm = async (password) => {
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        // Mostra un messaggio di successo e reindirizza
        alert("Account deleted successfully.");
        router.push("/");
      } catch (error) {
        alert(
          "Error deleting account. Please make sure the password is correct."
        );
      }
      showConfirmModal.value = false;
    };

    const handleCancel = () => {
      showConfirmModal.value = false;
    };

    onMounted(fetchUserData);

    // Le funzioni startEdit e deleteAccount rimangono invariate
    return {
      displayName,
      email,
      username,
      firstName,
      lastName,
      gender,
      country,
      logout,
      error,
      startEdit,
      deleteAccount,
      showConfirmModal,
      handleConfirm,
      handleCancel,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap");

.user-profile {
  font-family: "Oswald", sans-serif;
  font-size: 25px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.829), rgba(0, 0, 0, 0.5)),
    url("../assets/movies.jpg");
  color: white;
  padding: 10px;
  border-radius: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-size: cover;
  min-height: 90%; /* Assicura che .user-profile copra tutta l'altezza */
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

p {
  font-size: 20px;
}
button {
  background-color: #e50914; /* Colore rosso Netflix */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 10px;
  font-size: 15px;
  font-weight: bold;
}
button:last-child {
  margin-right: 0; /* Rimuove lo spazio a destra dall'ultimo bottone */
}

button:hover {
  background-color: #f40612;
}
.modal {
  /* Stili base della modal */
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error {
  color: red;
}
/* Altri stili per UserProfile.vue */
</style>
firebase firebase

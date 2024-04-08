<template>
  <div class="user-profile">
    <h1>Profilo Utente</h1>
    <p><strong>Nome Utente:</strong> {{ username }}</p>
    <p><strong>Email:</strong> {{ email }}</p>
    <p><strong>Nome:</strong> {{ firstName }}</p>
    <p><strong>Cognome:</strong> {{ lastName }}</p>
    <p><strong>Genere:</strong> {{ gender }}</p>
    <p><strong>Paese:</strong> {{ country }}</p>

    <!-- Pulsanti per la modifica e la cancellazione del profilo -->
    <button @click="startEdit">Modifica Profilo</button>
    <button @click="logout">Logout</button>
    <button @click="showConfirmModal = true">Cancella Account</button>
  <!-- ConfirmModal viene visualizzata quando showConfirmModal è true -->
    <ConfirmModal v-if="showConfirmModal"
                message="Sei sicuro di voler cancellare il tuo account? Reinserisci la tua password per confermare."
                @confirm="handleConfirm"
                @cancel="handleCancel" />

    <!-- Mostra un messaggio di errore se presente -->
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { reauthenticateWithCredential, EmailAuthProvider, deleteUser, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import ConfirmModal from '../components/ConfirmModal.vue'

export default {
  components: { ConfirmModal },
  setup () {
    const error = ref('')
    const displayName = ref('')
    const email = ref('')
    const username = ref('')
    const firstName = ref('')
    const lastName = ref('')
    const gender = ref('')
    const country = ref('')
    const router = useRouter()
    const showConfirmModal = ref(false)

    const logout = () => {
      signOut(auth).then(() => {
        // Reindirizza l'utente alla pagina di login dopo il logout
        router.push('/login')
      }).catch((error) => {
        // Gestisci eventuali errori durante il logout
        console.error('Errore durante il logout:', error)
      })
    }

    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const docSnap = await getDoc(userRef)
        if (docSnap.exists()) {
          // Imposta i valori dei dati utente
          const userData = docSnap.data()
          username.value = userData.username || 'Non specificato'
          firstName.value = userData.firstName || 'Non specificato'
          lastName.value = userData.lastName || 'Non specificato'
          gender.value = userData.gender || 'Non specificato'
          country.value = userData.country || 'Non specificato'
          // Email e displayName sono già disponibili tramite auth.currentUser
          email.value = auth.currentUser.email
          displayName.value = auth.currentUser.displayName || username.value // Usa username se displayName non è disponibile
        } else {
          console.log("Nessun documento trovato per l'utente corrente.")
        }
      }
    }

    const deleteAccount = async () => {
      try {
        await deleteUser(auth.currentUser)
        // Aggiungi qui il codice per gestire ciò che succede dopo la cancellazione dell'account, ad esempio:
        // Reindirizzare l'utente alla pagina di login o alla homepage
        router.push('/login')
      } catch (error) {
        console.error('Errore di cancellazione dell\'account:', error)
        error.value = error.message
      }
    }

    const startEdit = () => {
    // Esempio: navigazione a una pagina di modifica del profilo
    // Assicurati di avere definito una route per '/edit-profile' nel tuo router
      router.push('/edit-profile')
    }

    const handleConfirm = async (password) => {
      try {
        const user = auth.currentUser
        const credential = EmailAuthProvider.credential(user.email, password)
        await reauthenticateWithCredential(user, credential)
        await deleteUser(user)
        // Mostra un messaggio di successo e reindirizza
        alert('Account cancellato con successo.')
        router.push('/')
      } catch (error) {
        console.error('Errore durante la cancellazione dell\'account:', error)
        alert('Errore durante la cancellazione dell\'account. Assicurati che la password sia corretta.')
      }
      showConfirmModal.value = false
    }

    const handleCancel = () => {
      showConfirmModal.value = false
    }

    onMounted(fetchUserData)

    // Le funzioni startEdit e deleteAccount rimangono invariate
    return { displayName, email, username, firstName, lastName, gender, country, logout, error, startEdit, deleteAccount, showConfirmModal, handleConfirm, handleCancel }
  }
}
</script>

<style scoped>
.error {
  color: red;
}
/* Altri stili per UserProfile.vue */
</style>

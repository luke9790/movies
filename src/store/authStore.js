// src/store/authStore.js
import { reactive } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const state = reactive({
  user: null,
  isAuthReady: false
})

const auth = getAuth()

onAuthStateChanged(auth, (user) => {
  state.user = user
  state.isAuthReady = true
})

export function useAuthStore () {
  return { state }
}

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBVNij3UrEJ3bcZ0DJj776lIeKLdqtyW9A',
  authDomain: 'film-database-5d752.firebaseapp.com',
  projectId: 'film-database-5d752',
  storageBucket: 'film-database-5d752.appspot.com',
  messagingSenderId: '265059537649',
  appId: '1:265059537649:web:950580b42ddc9ecca70f50'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Ottieni un'istanza dei servizi Firebase che intendi utilizzare
const auth = getAuth(app)
const db = getFirestore(app)

// Esporta i servizi per poterli utilizzare in altre parti dell'app
export { auth, db }

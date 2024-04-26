import { createRouter, createWebHistory } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue";
import DashboardPage from "@/views/DashboardPage.vue";
import EditProfile from "@/views/EditProfile.vue";
import ActorDetail from "@/views/ActorDetail.vue";
import DirectorDetail from "@/views/DirectorDetail.vue";
import FilmSuggeriti from "@/views/FilmSuggeriti.vue";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "@firebase/auth";
import { useAuthStore } from "@/store/authStore";

let isAuthInitialized = false;

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "HomePage",
      component: HomePage,
    },
    {
      path: "/login",
      name: "LoginPage",
      component: LoginPage,
    },
    {
      path: "/film/:id",
      name: "MovieDetail",
      component: () => import("@/views/MovieDetail.vue"),
      props: true,
    },
    {
      path: "/dashboard",
      name: "DashboardPage",
      component: DashboardPage,
      meta: { requiresAuth: true }, // Aggiungi un meta campo per indicare che questa pagina richiede l'autenticazione
    },
    {
      path: "/suggest-movies",
      name: "SuggestMovies",
      component: FilmSuggeriti,
      meta: { requiresAuth: true }, // Opzionale: per rendere la pagina accessibile solo agli utenti loggati
    },
    {
      path: "/profile",
      name: "UserProfile",
      component: () => import("@/views/UserProfile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/edit-profile",
      name: "EditProfile",
      component: EditProfile,
    },
    {
      path: "/actor/:id",
      name: "ActorDetail",
      component: ActorDetail, // Assicurati di importare questo componente
    },
    {
      path: "/director/:id",
      name: "DirectorDetail",
      component: DirectorDetail,
    },
    {
      path: "/register",
      name: "RegisterPage",
      component: RegisterPage,
    },
  ],
});

const userState = {
  isAuthenticated: false,
};

onAuthStateChanged(auth, (user) => {
  userState.isAuthenticated = !!user;
  if (!isAuthInitialized) {
    isAuthInitialized = true;
    router.push(window.location.pathname); // Assicurati che questo sia eseguito solo una volta
  }
});

router.beforeEach((to, from, next) => {
  const { state } = useAuthStore();

  if (!state.isAuthReady) {
    const waitForAuth = setInterval(() => {
      if (state.isAuthReady) {
        clearInterval(waitForAuth);
        checkAccess(to, next);
      }
    }, 100);
  } else {
    checkAccess(to, next);
  }
});

function checkAccess(to, next) {
  const { state } = useAuthStore();
  if (to.matched.some((record) => record.meta.requiresAuth) && !state.user) {
    next("/login");
  } else {
    next();
  }
}

export default router;

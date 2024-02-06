import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from '@/services/firebase';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'games',
      component: () => import('../views/GamesView.vue')
    },
    {
      path: '/game/create',
      name: 'game-create',
      component: () => import('../views/GameCreate.vue')
    },
    {
      path: '/game/edit',
      name: 'game-edit',
      component: () => import('../views/GameEdit.vue')
    },
    {
      path: '/game/start',
      name: 'game-start',
      component: () => import('../views/GameView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log(user)
      if (to.name === 'home') {
        router.push({ name: 'games' })
      }
      // ...
    } else {
      if (to.name !== 'home') {
        router.push({ name: 'home' })
      }
      // User is signed out
      // ...
    }
    next()
  });
})

export default router

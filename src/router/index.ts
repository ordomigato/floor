import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/services/firebase';

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
      path: '/game/:id',
      name: 'game-edit',
      component: () => import('../views/GameEdit.vue')
    },
    {
      path: '/game/:id/players',
      name: 'game-players',
      component: () => import('../views/ManagePlayers.vue')
    },
    {
      path: '/game/:id/players/:playerId',
      name: 'player-edit',
      component: () => import('../views/PlayerEdit.vue')
    },
    {
      path: '/game/:id/categories',
      name: 'game-categories',
      component: () => import('../views/ManageCategories.vue')
    },
    {
      path: '/game/:id/categories/:catId',
      name: 'category-edit',
      component: () => import('../views/CategoryEdit.vue')
    },
    {
      path: '/game/:id/setup',
      name: 'game-setup',
      component: () => import('../views/GameSetup.vue')
    },
    {
      path: '/game/:id/start',
      name: 'game-start',
      component: () => import('../views/GameView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
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
